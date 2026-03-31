"""Positions router — user position tracking."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/positions")
async def get_positions():
    """Return user's open Pacifica positions."""
    return {"positions": [], "message": "Authentication required"}


@router.get("/positions/history")
async def get_position_history():
    """Return historical position snapshots."""
    return {"history": []}
