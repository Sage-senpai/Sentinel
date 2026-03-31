"""Guard router — SENTINEL Guard bot configuration and status."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class GuardConfigUpdate(BaseModel):
    position_symbol: str
    guard_enabled: bool = False
    threshold_pct: float = 15.0
    action_type: str = "partial_close"
    partial_close_pct: float = 50.0
    max_spend_usd: float | None = None


@router.get("/guard/config")
async def get_guard_config():
    """Return user's guard bot configuration."""
    return {"configs": [], "message": "Authentication required"}


@router.put("/guard/config")
async def update_guard_config(config: GuardConfigUpdate):
    """Update guard bot configuration for a position."""
    return {"status": "updated", "config": config.model_dump()}


@router.get("/guard/status")
async def get_guard_status():
    """Return current Guard agent status."""
    return {
        "active": False,
        "monitoring_count": 0,
        "last_check": None,
    }
