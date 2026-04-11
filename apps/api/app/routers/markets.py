"""Markets router — live Pacifica testnet data."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

PACIFICA = settings.pacifica_api_url


@router.get("/markets")
async def get_markets():
    """Fetch live markets from Pacifica testnet."""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get(f"{PACIFICA}/info")
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and data.get("data"):
                    return {"markets": data["data"], "source": "pacifica_live"}
    except Exception:
        pass
    return {"markets": [], "source": "demo"}


@router.get("/markets/{symbol}/orderbook")
async def get_orderbook(symbol: str):
    """Fetch live orderbook from Pacifica testnet."""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get(f"{PACIFICA}/book", params={"symbol": symbol})
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and data.get("data"):
                    book = data["data"]
                    levels = book.get("l", [[], []])
                    bids = [{"price": float(b["p"]), "size": float(b["a"])} for b in levels[0]] if len(levels) > 0 else []
                    asks = [{"price": float(a["p"]), "size": float(a["a"])} for a in levels[1]] if len(levels) > 1 else []
                    return {"symbol": symbol, "bids": bids, "asks": asks, "timestamp": book.get("t"), "source": "pacifica_live"}
    except Exception:
        pass
    return {"symbol": symbol, "bids": [], "asks": [], "source": "demo"}


@router.get("/markets/{symbol}/trades")
async def get_trades(symbol: str):
    """Fetch recent trades from Pacifica testnet."""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get(f"{PACIFICA}/trades", params={"symbol": symbol})
            if res.status_code == 200:
                data = res.json()
                if data.get("success") and data.get("data"):
                    trades = data["data"]
                    return {
                        "trades": [
                            {
                                "price": float(t["price"]),
                                "size": float(t["amount"]),
                                "side": t["side"],
                                "type": t.get("event_type", ""),
                                "timestamp": t.get("created_at", 0),
                            }
                            for t in trades[:50]
                        ],
                        "mark_price": float(trades[0]["price"]) if trades else 0,
                        "source": "pacifica_live",
                    }
    except Exception:
        pass
    return {"trades": [], "mark_price": 0, "source": "demo"}


@router.get("/markets/{symbol}/price")
async def get_price(symbol: str):
    """Get latest mark price from Pacifica trades."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{PACIFICA}/trades", params={"symbol": symbol})
            if res.status_code == 200:
                data = res.json()
                trades = data.get("data", [])
                if trades:
                    return {"symbol": symbol, "price": float(trades[0]["price"]), "source": "pacifica_live"}
    except Exception:
        pass
    return {"symbol": symbol, "price": 0, "source": "demo"}
