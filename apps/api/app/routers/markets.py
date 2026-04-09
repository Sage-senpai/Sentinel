"""Markets router — live Pacifica market data with demo fallback."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

DEMO_MARKETS = [
    {"symbol": "BTC-PERP", "baseAsset": "BTC", "quoteAsset": "USDC", "lastPrice": 65234.50, "volume24h": 142000000, "status": "active"},
    {"symbol": "ETH-PERP", "baseAsset": "ETH", "quoteAsset": "USDC", "lastPrice": 3245.80, "volume24h": 89000000, "status": "active"},
    {"symbol": "SOL-PERP", "baseAsset": "SOL", "quoteAsset": "USDC", "lastPrice": 148.65, "volume24h": 34000000, "status": "active"},
    {"symbol": "ARB-PERP", "baseAsset": "ARB", "quoteAsset": "USDC", "lastPrice": 1.12, "volume24h": 8500000, "status": "active"},
]


@router.get("/markets")
async def get_markets():
    """Fetch live markets from Pacifica, fallback to demo."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{settings.pacifica_api_url}/markets")
            if res.status_code == 200:
                return res.json()
    except Exception:
        pass
    return {"markets": DEMO_MARKETS}


@router.get("/markets/{symbol}/orderbook")
async def get_orderbook(symbol: str):
    """Fetch live orderbook from Pacifica, fallback to demo."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{settings.pacifica_api_url}/markets/{symbol}/orderbook")
            if res.status_code == 200:
                return res.json()
    except Exception:
        pass
    return {"symbol": symbol, "bids": [[65200, 1.5], [65150, 2.3]], "asks": [[65250, 1.8], [65300, 3.1]]}
