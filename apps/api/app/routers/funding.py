"""Funding rates — live Pacifica data with demo fallback."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

DEMO_RATES = [
    {"market": "BTC-PERP", "rate_8h": 0.0012, "annualized_apr": 15.77, "next_funding_time": "2026-04-08T16:00:00Z", "mark_price": 65234.50},
    {"market": "ETH-PERP", "rate_8h": -0.0008, "annualized_apr": -10.51, "next_funding_time": "2026-04-08T16:00:00Z", "mark_price": 3245.80},
    {"market": "SOL-PERP", "rate_8h": 0.0025, "annualized_apr": 32.85, "next_funding_time": "2026-04-08T16:00:00Z", "mark_price": 148.65},
    {"market": "ARB-PERP", "rate_8h": 0.0003, "annualized_apr": 3.94, "next_funding_time": "2026-04-08T16:00:00Z", "mark_price": 1.12},
]


@router.get("/funding/rates")
async def get_funding_rates():
    """Fetch live funding rates from Pacifica, fallback to demo."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{settings.pacifica_api_url}/funding_rates")
            if res.status_code == 200:
                data = res.json()
                if isinstance(data, list) and len(data) > 0:
                    return {"rates": data, "source": "pacifica"}
    except Exception:
        pass
    return {"rates": DEMO_RATES, "source": "demo"}


@router.get("/funding/forecast/{symbol}")
async def get_funding_forecast(symbol: str):
    forecasts = {
        "BTC-PERP": {"symbol": "BTC-PERP", "predictions": [0.0014, 0.0011, 0.0009, 0.0013], "confidence_upper": [0.0020, 0.0018, 0.0016, 0.0021], "confidence_lower": [0.0008, 0.0004, 0.0002, 0.0005]},
        "ETH-PERP": {"symbol": "ETH-PERP", "predictions": [-0.0006, -0.0003, 0.0001, -0.0002], "confidence_upper": [0.0002, 0.0005, 0.0009, 0.0006], "confidence_lower": [-0.0014, -0.0011, -0.0007, -0.0010]},
        "SOL-PERP": {"symbol": "SOL-PERP", "predictions": [0.0022, 0.0019, 0.0028, 0.0024], "confidence_upper": [0.0030, 0.0027, 0.0036, 0.0032], "confidence_lower": [0.0014, 0.0011, 0.0020, 0.0016]},
    }
    return forecasts.get(symbol, {"symbol": symbol, "predictions": [], "confidence_upper": [], "confidence_lower": []})


@router.get("/funding/history/{symbol}")
async def get_funding_history(symbol: str, days: int = 30):
    return {"history": [], "message": f"Historical data for {symbol} over {days} days"}
