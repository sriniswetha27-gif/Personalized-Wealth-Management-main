from fastapi import APIRouter

from app.api.routes import auth, goals, market, planning, portfolio

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(portfolio.router)
api_router.include_router(goals.router)
api_router.include_router(market.router)
api_router.include_router(planning.router)
