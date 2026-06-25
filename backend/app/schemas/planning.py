from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    initial_amount: float = Field(ge=0)
    monthly_contribution: float = Field(ge=0)
    annual_return_pct: float = Field(default=8, ge=-50, le=50)
    annual_volatility_pct: float = Field(default=12, ge=0, le=100)
    years: int = Field(default=10, ge=1, le=60)


class SimulationPoint(BaseModel):
    year: int
    projected_value: float
    conservative_value: float
    optimistic_value: float


class SimulationResponse(BaseModel):
    points: list[SimulationPoint]
    final_projected_value: float


class Recommendation(BaseModel):
    title: str
    rationale: str
    action: str
    priority: str


class RecommendationResponse(BaseModel):
    risk_profile: str
    recommendations: list[Recommendation]
