"""Funding rates — live Pacifica data with demo fallback."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

PACIFICA_INFO_URL = f"{settings.pacifica_api_url}/info"


@router.get("/funding/rates")
async def get_funding_rates():
    """Fetch live funding rates from Pacifica testnet /info endpoint."""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get(PACIFICA_INFO_URL)
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and data.get("data"):
                    markets = data["data"]
                    # Filter perpetuals only and map to our format
                    rates = []
                    for m in markets:
                        if m.get("instrument_type") != "perpetual":
                            continue
                        rate = float(m.get("funding_rate", 0))
                        next_rate = float(m.get("next_funding_rate", 0))
                        apr = rate * 3 * 365 * 100  # 3 epochs/day * 365 days * 100%
                        rates.append({
                            "market": m["symbol"],
                            "rate_8h": rate,
                            "annualized_apr": round(apr, 2),
                            "next_funding_rate": next_rate,
                            "mark_price": 0,
                            "max_leverage": m.get("max_leverage", 1),
                        })
                    if rates:
                        return {"rates": rates, "source": "pacifica_live"}
    except Exception:
        pass

    return {
        "rates": [
            {"market": "BTC", "rate_8h": 0.000015, "annualized_apr": 1.64, "next_funding_rate": 0.000015, "mark_price": 0, "max_leverage": 50},
            {"market": "ETH", "rate_8h": 0.000015, "annualized_apr": 1.64, "next_funding_rate": 0.000015, "mark_price": 0, "max_leverage": 50},
            {"market": "SOL", "rate_8h": 0.000015, "annualized_apr": 1.64, "next_funding_rate": 0.000015, "mark_price": 0, "max_leverage": 20},
        ],
        "source": "demo",
    }


@router.get("/funding/forecast/{symbol}")
async def get_funding_forecast(symbol: str):
    forecasts = {
        "BTC": {"symbol": "BTC", "predictions": [0.000015, 0.000012, 0.000018, 0.000015], "confidence_upper": [0.0001, 0.00008, 0.00012, 0.0001], "confidence_lower": [-0.00007, -0.00006, -0.00008, -0.00007]},
        "ETH": {"symbol": "ETH", "predictions": [0.000015, 0.000010, 0.000020, 0.000015], "confidence_upper": [0.00008, 0.00006, 0.0001, 0.00008], "confidence_lower": [-0.00005, -0.00004, -0.00006, -0.00005]},
        "SOL": {"symbol": "SOL", "predictions": [0.000015, 0.000015, 0.000015, 0.000015], "confidence_upper": [0.00005, 0.00005, 0.00005, 0.00005], "confidence_lower": [-0.00002, -0.00002, -0.00002, -0.00002]},
    }
    return forecasts.get(symbol, {"symbol": symbol, "predictions": [], "confidence_upper": [], "confidence_lower": []})


@router.get("/funding/history/{symbol}")
async def get_funding_history(symbol: str, days: int = 30):
    return {"history": [], "message": f"Historical data for {symbol} over {days} days"}
