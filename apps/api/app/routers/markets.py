"""Markets router — live Pacifica testnet data with demo fallback."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

PACIFICA_INFO_URL = f"{settings.pacifica_api_url}/info"

DEMO_MARKETS = [
    {"symbol": "BTC", "base_asset": "BTC", "tick_size": "1", "lot_size": "0.00001", "max_leverage": 50, "funding_rate": "0.000015", "next_funding_rate": "0.000015", "instrument_type": "perpetual"},
    {"symbol": "ETH", "base_asset": "ETH", "tick_size": "0.1", "lot_size": "0.0001", "max_leverage": 50, "funding_rate": "0.000015", "next_funding_rate": "0.000015", "instrument_type": "perpetual"},
    {"symbol": "SOL", "base_asset": "SOL", "tick_size": "0.01", "lot_size": "0.01", "max_leverage": 20, "funding_rate": "0.000015", "next_funding_rate": "0.000015", "instrument_type": "perpetual"},
    {"symbol": "ARB", "base_asset": "ARB", "tick_size": "0.00001", "lot_size": "0.1", "max_leverage": 10, "funding_rate": "-0.009817", "next_funding_rate": "-0.009735", "instrument_type": "perpetual"},
]


@router.get("/markets")
async def get_markets():
    """Fetch live markets from Pacifica testnet, fallback to demo."""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get(PACIFICA_INFO_URL)
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and data.get("data"):
                    return {"markets": data["data"], "source": "pacifica_live"}
    except Exception:
        pass
    return {"markets": DEMO_MARKETS, "source": "demo"}


@router.get("/markets/{symbol}/orderbook")
async def get_orderbook(symbol: str):
    """Fetch orderbook — placeholder until Pacifica orderbook endpoint is discovered."""
    return {
        "symbol": symbol,
        "bids": [[65200, 1.5], [65150, 2.3], [65100, 3.8]],
        "asks": [[65250, 1.8], [65300, 3.1], [65350, 2.5]],
        "source": "demo",
    }
