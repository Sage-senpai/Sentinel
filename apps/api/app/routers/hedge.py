"""FX Hedge — live CoinGecko rates for Africa & Asia with demo fallback."""

import httpx
from pydantic import BaseModel
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

CURRENCIES = {
    "NGN": {"name": "Nigerian Naira", "region": "Africa", "flag": "NG", "demo_rate": 1580.50},
    "ZAR": {"name": "South African Rand", "region": "Africa", "flag": "ZA", "demo_rate": 18.40},
    "INR": {"name": "Indian Rupee", "region": "Asia", "flag": "IN", "demo_rate": 84.50},
    "PHP": {"name": "Philippine Peso", "region": "Asia", "flag": "PH", "demo_rate": 56.80},
    "IDR": {"name": "Indonesian Rupiah", "region": "Asia", "flag": "ID", "demo_rate": 16200.0},
    "THB": {"name": "Thai Baht", "region": "Asia", "flag": "TH", "demo_rate": 35.20},
}

COINGECKO_CODES = [c.lower() for c in CURRENCIES]
_cached_btc_usd = 71000.0
_cached_rates: dict[str, dict] = {}


class HedgeRequest(BaseModel):
    currency: str = "NGN"
    portfolio_value_usd: float = 0
    hedge_ratio: float = 50
    duration_days: int = 30


@router.get("/hedge/rates")
async def get_fx_rates():
    """Fetch live FX rates from CoinGecko for Africa & Asia currencies."""
    global _cached_btc_usd, _cached_rates
    if settings.coingecko_api_key:
        try:
            vs_currencies = ",".join(COINGECKO_CODES) + ",usd"
            async with httpx.AsyncClient(timeout=8) as client:
                res = await client.get(
                    "https://api.coingecko.com/api/v3/simple/price",
                    params={
                        "ids": "bitcoin",
                        "vs_currencies": vs_currencies,
                        "include_24hr_change": "true",
                        "x_cg_demo_api_key": settings.coingecko_api_key,
                    },
                )
                if res.status_code == 200:
                    data = res.json().get("bitcoin", {})
                    btc_usd = data.get("usd", 0)
                    if btc_usd > 0:
                        _cached_btc_usd = btc_usd

                    live_rates = {}
                    for code, meta in CURRENCIES.items():
                        cg_code = code.lower()
                        local_price = data.get(cg_code, 0)
                        change = data.get(f"{cg_code}_24h_change", 0)

                        rate_to_usd = local_price / btc_usd if (local_price > 0 and btc_usd > 0) else meta["demo_rate"]

                        live_rates[code] = {
                            "rate": round(rate_to_usd, 2),
                            "change_24h": round(change or 0, 2),
                            "name": meta["name"],
                            "region": meta["region"],
                            "flag": meta["flag"],
                        }

                    _cached_rates = live_rates
                    if any(v["rate"] > 0 for v in live_rates.values()):
                        return {"rates": live_rates, "source": "coingecko", "btc_usd": round(btc_usd, 2)}
        except Exception:
            pass

    # Demo fallback
    demo = {}
    for code, meta in CURRENCIES.items():
        demo[code] = {
            "rate": meta["demo_rate"],
            "change_24h": 0,
            "name": meta["name"],
            "region": meta["region"],
            "flag": meta["flag"],
        }
    return {"rates": demo, "source": "demo", "btc_usd": _cached_btc_usd}


@router.post("/hedge/calculate")
async def calculate_hedge(req: HedgeRequest):
    """Calculate hedge recommendation with live BTC price."""
    if req.portfolio_value_usd <= 0:
        return {
            "currency": req.currency,
            "short_size_btc": 0,
            "required_margin_usd": 0,
            "daily_carry_usd": 0,
            "daily_carry_local": 0,
            "total_cost_usd": 0,
            "recommendation": "Enter a portfolio value to calculate",
        }

    btc_price = _cached_btc_usd
    funding_rate = 0.000015
    leverage = 2

    hedge_amount = req.portfolio_value_usd * (req.hedge_ratio / 100)
    short_size = hedge_amount / btc_price
    margin = hedge_amount / leverage
    daily_carry = hedge_amount * funding_rate * 3
    total_cost = daily_carry * req.duration_days

    local_rate = _cached_rates.get(req.currency, {}).get("rate", CURRENCIES.get(req.currency, {}).get("demo_rate", 1))
    currency_name = CURRENCIES.get(req.currency, {}).get("name", req.currency)

    return {
        "currency": req.currency,
        "currency_name": currency_name,
        "short_size_btc": round(short_size, 6),
        "required_margin_usd": round(margin, 2),
        "daily_carry_usd": round(daily_carry, 4),
        "daily_carry_local": round(daily_carry * local_rate, 2),
        "total_cost_usd": round(total_cost, 2),
        "btc_price": round(btc_price, 2),
        "recommendation": f"Short {round(short_size, 4)} BTC on Pacifica at {leverage}x leverage.\nRequired margin: ${round(margin, 2)} USDC\nDaily carry: ${round(daily_carry, 4)} ({round(daily_carry * local_rate, 2)} {req.currency})\nTotal cost ({req.duration_days}d): ${round(total_cost, 2)}",
    }
