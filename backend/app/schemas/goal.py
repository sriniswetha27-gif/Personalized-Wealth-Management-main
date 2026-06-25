from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    target_amount: Decimal = Field(gt=0)
    current_amount: Decimal = Field(default=0, ge=0)
    target_date: date
    priority: str = "medium"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: str | None = None
    target_amount: Decimal | None = Field(default=None, gt=0)
    current_amount: Decimal | None = Field(default=None, ge=0)
    target_date: date | None = None
    priority: str | None = None


class GoalRead(GoalBase):
    id: int
    owner_id: int
    progress_pct: float = 0

    model_config = {"from_attributes": True}
