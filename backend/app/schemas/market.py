from datetime import datetime

from pydantic import BaseModel


class Quote(BaseModel):
    symbol: str
    price: float
    currency: str = "USD"
    source: str
    fetched_at: datetime


class PricePoint(BaseModel):
    date: str
    close: float


class MarketHistory(BaseModel):
    symbol: str
    points: list[PricePoint]
