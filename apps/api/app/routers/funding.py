"""Funding Rate router — live rates and forecasts."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/funding/rates")
async def get_funding_rates():
    """Return current funding rates for all Pacifica markets."""
    return {"rates": [], "message": "Pacifica funding data not yet connected"}


@router.get("/funding/forecast/{symbol}")
async def get_funding_forecast(symbol: str):
    """Return 4-epoch funding rate forecast for a market."""
    return {
        "symbol": symbol,
        "predictions": [],
        "confidence": {},
        "message": "Forecast model not yet running",
    }


@router.get("/funding/history/{symbol}")
async def get_funding_history(symbol: str, days: int = 30):
    """Return historical funding rates."""
    return {"symbol": symbol, "history": [], "days": days}
