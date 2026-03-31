"""Whale Intelligence router — whale events and watchlist."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/whale/events")
async def get_whale_events():
    """Return recent whale events."""
    return {"events": [], "message": "Elfa AI not yet connected"}


@router.get("/whale/convergence")
async def get_convergence_alerts():
    """Return Smart Money Convergence alerts."""
    return {"alerts": []}


@router.get("/whale/watchlist")
async def get_watchlist():
    """Return user's whale watchlist."""
    return {"watchlist": []}
