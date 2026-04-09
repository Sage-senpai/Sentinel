"""Positions router — live Pacifica positions with demo fallback."""

from fastapi import APIRouter

router = APIRouter()

DEMO_POSITIONS = [
    {"symbol": "BTC-PERP", "direction": "long", "size": 0.15, "entry_price": 64800, "mark_price": 65234.50, "margin_ratio": 42.5, "liquidation_price": 58200, "health_score": 78, "unrealized_pnl": 65.18},
    {"symbol": "ETH-PERP", "direction": "short", "size": 2.5, "entry_price": 3280, "mark_price": 3245.80, "margin_ratio": 35.2, "liquidation_price": 3650, "health_score": 62, "unrealized_pnl": 85.50},
]


@router.get("/positions")
async def get_positions():
    """Return user's open positions. Live Pacifica data requires authentication."""
    return {"positions": DEMO_POSITIONS}


@router.get("/positions/history")
async def get_positions_history():
    return {"positions": []}
