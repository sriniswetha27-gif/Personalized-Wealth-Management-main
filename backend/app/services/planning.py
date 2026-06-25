from app.models.goal import Goal
from app.models.portfolio import Holding
from app.schemas.planning import (
    Recommendation,
    RecommendationResponse,
    SimulationPoint,
    SimulationRequest,
    SimulationResponse,
)


def run_simulation(payload: SimulationRequest) -> SimulationResponse:
    annual_return = payload.annual_return_pct / 100
    conservative_return = (payload.annual_return_pct - payload.annual_volatility_pct * 0.5) / 100
    optimistic_return = (payload.annual_return_pct + payload.annual_volatility_pct * 0.5) / 100

    projected = payload.initial_amount
    conservative = payload.initial_amount
    optimistic = payload.initial_amount
    points: list[SimulationPoint] = []

    for year in range(1, payload.years + 1):
        for _ in range(12):
            projected = (projected + payload.monthly_contribution) * (1 + annual_return / 12)
            conservative = (conservative + payload.monthly_contribution) * (1 + conservative_return / 12)
            optimistic = (optimistic + payload.monthly_contribution) * (1 + optimistic_return / 12)
        points.append(
            SimulationPoint(
                year=year,
                projected_value=round(projected, 2),
                conservative_value=round(conservative, 2),
                optimistic_value=round(optimistic, 2),
            )
        )

    return SimulationResponse(points=points, final_projected_value=points[-1].projected_value)


def build_recommendations(
    risk_profile: str,
    holdings: list[Holding],
    goals: list[Goal],
) -> RecommendationResponse:
    recs: list[Recommendation] = []
    equity_count = sum(1 for item in holdings if item.asset_class == "equity")
    total_holdings = len(holdings)

    if total_holdings == 0:
        recs.append(
            Recommendation(
                title="Start portfolio tracking",
                rationale="No holdings are recorded yet, so live valuation and allocation analysis cannot run.",
                action="Add your current investments with quantity and average cost.",
                priority="high",
            )
        )
    elif equity_count / total_holdings > 0.8 and risk_profile == "conservative":
        recs.append(
            Recommendation(
                title="Reduce equity concentration",
                rationale="A conservative profile usually benefits from lower volatility and more stable assets.",
                action="Review bond, cash, or index-fund allocation before adding more equity exposure.",
                priority="high",
            )
        )

    for goal in goals:
        progress = float(goal.current_amount / goal.target_amount) if goal.target_amount else 0
        if progress < 0.35:
            recs.append(
                Recommendation(
                    title=f"Accelerate {goal.name}",
                    rationale="This goal is still early in its funding path.",
                    action="Increase monthly contribution or extend the target date to improve success probability.",
                    priority="medium",
                )
            )

    if not recs:
        recs.append(
            Recommendation(
                title="Maintain disciplined rebalancing",
                rationale="Your current portfolio and goal progress do not show urgent gaps.",
                action="Review allocations monthly and rebalance when an asset class drifts more than 5 percent.",
                priority="low",
            )
        )

    return RecommendationResponse(risk_profile=risk_profile, recommendations=recs)
