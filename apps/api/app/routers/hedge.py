"""Africa FX Hedge — live CoinGecko rates with demo fallback."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

DEMO_RATES = {
    "NGN": {"rate": 1580.50, "change_24h": -0.32},
    "KES": {"rate": 129.80, "change_24h": 0.15},
    "GHS": {"rate": 15.20, "change_24h": -0.08},
}


@router.get("/hedge/rates")
async def get_fx_rates():
    """Fetch live FX rates from CoinGecko, fallback to demo."""
    if settings.coingecko_api_key:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                res = await client.get(
                    "https://api.coingecko.com/api/v3/simple/price",
                    params={
                        "ids": "bitcoin",
                        "vs_currencies": "ngn,kes,ghs,usd",
                        "include_24hr_change": "true",
                        "x_cg_demo_api_key": settings.coingecko_api_key,
                    },
                )
                if res.status_code == 200:
                    data = res.json().get("bitcoin", {})
                    btc_usd = data.get("usd", 65000)
                    live_rates = {}
                    for currency in ["ngn", "kes", "ghs"]:
                        local_price = data.get(currency, 0)
                        change_key = f"{currency}_24h_change"
                        change = data.get(change_key, 0)
                        rate_to_usd = local_price / btc_usd if btc_usd > 0 else 0
                        live_rates[currency.upper()] = {
                            "rate": round(rate_to_usd, 2) if rate_to_usd > 0 else round(local_price / 65000, 2),
                            "change_24h": round(change or 0, 2),
                        }
                    if any(v["rate"] > 0 for v in live_rates.values()):
                        return {"rates": live_rates, "source": "coingecko"}
        except Exception:
            pass
    return {"rates": DEMO_RATES, "source": "demo"}


@router.post("/hedge/calculate")
async def calculate_hedge(
    currency: str = "NGN",
    portfolio_value_usd: float = 0,
    hedge_ratio: float = 50,
    duration_days: int = 30,
):
    """Calculate hedge recommendation."""
    if portfolio_value_usd <= 0:
        return {"currency": currency, "short_size_btc": 0, "required_margin_usd": 0, "daily_carry_usd": 0, "recommendation": "Enter a portfolio value to calculate"}

    btc_price = 65000
    funding_rate = 0.0001
    leverage = 2

    hedge_amount = portfolio_value_usd * (hedge_ratio / 100)
    short_size = hedge_amount / btc_price
    margin = hedge_amount / leverage
    daily_carry = hedge_amount * funding_rate * 3
    total_cost = daily_carry * duration_days

    return {
        "currency": currency,
        "short_size_btc": round(short_size, 6),
        "required_margin_usd": round(margin, 2),
        "daily_carry_usd": round(daily_carry, 2),
        "daily_carry_local": round(daily_carry * DEMO_RATES.get(currency, {}).get("rate", 1), 2),
        "total_cost_usd": round(total_cost, 2),
        "recommendation": f"Short {round(short_size, 4)} BTC on Pacifica at {leverage}x leverage. Required margin: ${round(margin, 2)}. Daily carry cost: ${round(daily_carry, 2)} ({round(daily_carry * DEMO_RATES.get(currency, {}).get('rate', 1), 2)} {currency}). Total cost over {duration_days} days: ${round(total_cost, 2)}.",
    }
