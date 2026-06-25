from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.portfolio import Holding
from app.models.user import User
from app.schemas.portfolio import HoldingCreate, HoldingRead, HoldingUpdate, PortfolioSummary
from app.services.market_data import MarketDataService

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/holdings", response_model=list[HoldingRead])
def list_holdings(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[Holding]:
    return list(db.scalars(select(Holding).where(Holding.owner_id == current_user.id)))


@router.post("/holdings", response_model=HoldingRead, status_code=status.HTTP_201_CREATED)
def create_holding(
    payload: HoldingCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Holding:
    holding_data = payload.model_dump()
    holding_data["symbol"] = payload.symbol.upper()
    holding = Holding(**holding_data, owner_id=current_user.id)
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


@router.patch("/holdings/{holding_id}", response_model=HoldingRead)
def update_holding(
    holding_id: int,
    payload: HoldingUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Holding:
    holding = db.get(Holding, holding_id)
    if not holding or holding.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Holding not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(holding, key, value.upper() if key == "symbol" and isinstance(value, str) else value)
    db.commit()
    db.refresh(holding)
    return holding


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holding(
    holding_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    holding = db.get(Holding, holding_id)
    if not holding or holding.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Holding not found")
    db.delete(holding)
    db.commit()


@router.get("/summary", response_model=PortfolioSummary)
async def portfolio_summary(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortfolioSummary:
    holdings = list(db.scalars(select(Holding).where(Holding.owner_id == current_user.id)))
    service = MarketDataService()
    rows = []
    total_value = 0.0
    total_cost = 0.0
    for holding in holdings:
        quote = await service.get_quote(holding.symbol)
        quantity = float(holding.quantity)
        average_cost = float(holding.average_cost)
        market_value = quantity * quote.price
        cost_basis = quantity * average_cost
        gain = market_value - cost_basis
        total_value += market_value
        total_cost += cost_basis
        rows.append(
            {
                **HoldingRead.model_validate(holding).model_dump(),
                "latest_price": round(quote.price, 2),
                "market_value": round(market_value, 2),
                "cost_basis": round(cost_basis, 2),
                "unrealized_gain": round(gain, 2),
                "unrealized_gain_pct": round((gain / cost_basis) * 100, 2) if cost_basis else 0,
            }
        )
    gain_total = total_value - total_cost
    return PortfolioSummary(
        total_market_value=round(total_value, 2),
        total_cost_basis=round(total_cost, 2),
        total_unrealized_gain=round(gain_total, 2),
        total_unrealized_gain_pct=round((gain_total / total_cost) * 100, 2) if total_cost else 0,
        holdings=rows,
    )
