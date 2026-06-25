from celery import Celery

from app.core.config import get_settings

settings = get_settings()
celery_app = Celery("pwma", broker=settings.REDIS_URL, backend=settings.REDIS_URL)


@celery_app.task(name="market.refresh_prices")
def refresh_prices() -> dict[str, str]:
    return {"status": "scheduled price refresh placeholder"}
