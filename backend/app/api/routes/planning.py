from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.goal import Goal
from app.models.portfolio import Holding
from app.models.user import User
from app.schemas.planning import RecommendationResponse, SimulationRequest, SimulationResponse
from app.services.planning import build_recommendations, run_simulation

router = APIRouter(prefix="/planning", tags=["planning"])


@router.post("/simulate", response_model=SimulationResponse)
def simulate(payload: SimulationRequest) -> SimulationResponse:
    return run_simulation(payload)


@router.get("/recommendations", response_model=RecommendationResponse)
def recommendations(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> RecommendationResponse:
    holdings = list(db.scalars(select(Holding).where(Holding.owner_id == current_user.id)))
    goals = list(db.scalars(select(Goal).where(Goal.owner_id == current_user.id)))
    return build_recommendations(current_user.risk_profile, holdings, goals)
