from datetime import datetime, timezone

import httpx
import yfinance as yf

from app.core.config import get_settings
from app.schemas.market import MarketHistory, PricePoint, Quote


class MarketDataService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def get_quote(self, symbol: str) -> Quote:
        normalized = symbol.upper()
        if self.settings.ALPHA_VANTAGE_API_KEY:
            quote = await self._get_alpha_vantage_quote(normalized)
            if quote:
                return quote
        return self._get_yahoo_quote(normalized)

    async def _get_alpha_vantage_quote(self, symbol: str) -> Quote | None:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": self.settings.ALPHA_VANTAGE_API_KEY,
        }
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json().get("Global Quote", {})
            price = float(data.get("05. price", 0))
            if price <= 0:
                return None
            return Quote(symbol=symbol, price=price, source="alpha_vantage", fetched_at=datetime.now(timezone.utc))
        except (httpx.HTTPError, ValueError, TypeError):
            return None

    def _get_yahoo_quote(self, symbol: str) -> Quote:
        price = 0.0
        currency = "USD"
        source = "yahoo_finance"
        try:
            info = yf.Ticker(symbol).fast_info
            price = float(info.get("last_price") or info.get("regular_market_price") or 0)
            currency = str(info.get("currency") or "USD")
        except Exception:
            # Market providers can throttle or reject serverless IPs. Portfolio
            # pages should remain usable even when a quote provider is offline.
            source = "estimated_fallback"
        if price <= 0:
            price = self._deterministic_fallback_price(symbol)
            source = "estimated_fallback"
        return Quote(symbol=symbol, price=price, currency=currency, source=source, fetched_at=datetime.now(timezone.utc))

    def get_history(self, symbol: str, period: str = "6mo") -> MarketHistory:
        normalized = symbol.upper()
        try:
            frame = yf.Ticker(normalized).history(period=period)
        except Exception:
            return MarketHistory(symbol=normalized, points=[])
        points = [
            PricePoint(date=str(index.date()), close=round(float(row["Close"]), 2))
            for index, row in frame.tail(120).iterrows()
        ]
        return MarketHistory(symbol=normalized, points=points)

    @staticmethod
    def _deterministic_fallback_price(symbol: str) -> float:
        seed = sum(ord(char) for char in symbol.upper())
        return round(50 + (seed % 250) + (seed % 17) / 10, 2)
