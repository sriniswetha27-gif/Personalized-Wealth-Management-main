from decimal import Decimal

from pydantic import BaseModel, Field


class HoldingBase(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    name: str | None = None
    quantity: Decimal = Field(gt=0)
    average_cost: Decimal = Field(ge=0)
    asset_class: str = "equity"


class HoldingCreate(HoldingBase):
    pass


class HoldingUpdate(BaseModel):
    name: str | None = None
    quantity: Decimal | None = Field(default=None, gt=0)
    average_cost: Decimal | None = Field(default=None, ge=0)
    asset_class: str | None = None


class HoldingRead(HoldingBase):
    id: int
    owner_id: int

    model_config = {"from_attributes": True}


class HoldingValuation(HoldingRead):
    latest_price: float
    market_value: float
    cost_basis: float
    unrealized_gain: float
    unrealized_gain_pct: float


class PortfolioSummary(BaseModel):
    total_market_value: float
    total_cost_basis: float
    total_unrealized_gain: float
    total_unrealized_gain_pct: float
    holdings: list[HoldingValuation]
