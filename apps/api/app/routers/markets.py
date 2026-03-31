"""Markets router — proxies Pacifica market data."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/markets")
async def get_markets():
    """Return all active Pacifica markets."""
    return {"markets": [], "message": "Pacifica market data not yet connected"}


@router.get("/markets/{symbol}/orderbook")
async def get_orderbook(symbol: str):
    """Return current orderbook depth for a market."""
    return {"symbol": symbol, "bids": [], "asks": []}
