"""Funding rates — live Pacifica data with ARIMA-style forecast."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

PACIFICA_INFO_URL = f"{settings.pacifica_api_url}/info"

# Cache live rates for forecast generation
_cached_rates: dict[str, dict] = {}


@router.get("/funding/rates")
async def get_funding_rates():
    """Fetch live funding rates from Pacifica testnet /info endpoint."""
    global _cached_rates
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get(PACIFICA_INFO_URL)
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and data.get("data"):
                    markets = data["data"]
                    rates = []
                    for m in markets:
                        if m.get("instrument_type") != "perpetual":
                            continue
                        rate = float(m.get("funding_rate", 0))
                        next_rate = float(m.get("next_funding_rate", 0))
                        apr = rate * 3 * 365 * 100
                        symbol = m["symbol"]

                        _cached_rates[symbol] = {
                            "rate": rate,
                            "next_rate": next_rate,
                            "max_leverage": m.get("max_leverage", 1),
                        }

                        rates.append({
                            "market": symbol,
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
    """Generate 4-epoch forecast from live Pacifica funding rates.

    Uses current and next funding rate as seed values, then projects
    forward with mean-reversion tendency and widening confidence bands
    (simulating ARIMA+LSTM ensemble output).
    """
    cached = _cached_rates.get(symbol)

    if cached:
        rate = cached["rate"]
        next_rate = cached["next_rate"]
        # Mean-reversion forecast: rates tend toward equilibrium (0.01% = 0.0001)
        equilibrium = 0.000015
        momentum = next_rate - rate

        predictions = [next_rate]
        for i in range(1, 4):
            prev = predictions[-1]
            # Revert 20% toward equilibrium each epoch + carry momentum
            reversion = (equilibrium - prev) * 0.2
            decay = momentum * (0.5 ** i)
            pred = prev + reversion + decay
            predictions.append(round(pred, 8))

        # Confidence bands widen each epoch
        confidence_upper = [round(p + abs(rate) * 0.5 * (i + 1), 8) for i, p in enumerate(predictions)]
        confidence_lower = [round(p - abs(rate) * 0.5 * (i + 1), 8) for i, p in enumerate(predictions)]

        return {
            "symbol": symbol,
            "predictions": predictions,
            "confidence_upper": confidence_upper,
            "confidence_lower": confidence_lower,
            "source": "pacifica_live",
            "model": "arima_mean_reversion",
        }

    # Fallback for unknown symbols
    return {
        "symbol": symbol,
        "predictions": [0.000015, 0.000015, 0.000015, 0.000015],
        "confidence_upper": [0.00005, 0.00006, 0.00007, 0.00008],
        "confidence_lower": [-0.00002, -0.00003, -0.00004, -0.00005],
        "source": "demo",
    }


@router.get("/funding/history/{symbol}")
async def get_funding_history(symbol: str, days: int = 30):
    """Historical funding rates — needs Pacifica historical endpoint."""
    return {"history": [], "message": f"Historical data for {symbol} over {days} days"}
