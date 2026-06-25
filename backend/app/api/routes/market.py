from fastapi import APIRouter

from app.schemas.market import MarketHistory, Quote
from app.services.market_data import MarketDataService

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/quote/{symbol}", response_model=Quote)
async def get_quote(symbol: str) -> Quote:
    return await MarketDataService().get_quote(symbol)


@router.get("/history/{symbol}", response_model=MarketHistory)
def get_history(symbol: str, period: str = "6mo") -> MarketHistory:
    return MarketDataService().get_history(symbol, period)
