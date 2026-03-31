"""Africa FX Hedge router — hedge calculation and FX rates."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/hedge/rates")
async def get_fx_rates():
    """Return current NGN/KES/GHS to USD rates."""
    return {
        "rates": {
            "NGN": {"rate": 0, "change_24h": 0},
            "KES": {"rate": 0, "change_24h": 0},
            "GHS": {"rate": 0, "change_24h": 0},
        },
        "message": "CoinGecko not yet connected",
    }


@router.post("/hedge/calculate")
async def calculate_hedge(
    currency: str = "NGN",
    portfolio_value_usd: float = 0,
    hedge_ratio: float = 50,
    duration_days: int = 30,
):
    """Calculate hedge recommendation."""
    return {
        "currency": currency,
        "short_size_btc": 0,
        "required_margin_usd": 0,
        "daily_carry_usd": 0,
        "recommendation": "Connect to Pacifica to calculate hedge",
    }
