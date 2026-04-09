"""Guard router — SENTINEL Guard bot configuration and status."""

from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()


class GuardConfigUpdate(BaseModel):
    position_symbol: str = ""
    guard_enabled: bool = False
    threshold_pct: float = 15.0
    action_type: str = "partial_close"
    partial_close_pct: float = 50.0
    max_spend_usd: float | None = None


# In-memory store (moves to DB in production)
_configs: dict[str, dict] = {}


@router.get("/guard/config")
async def get_guard_config():
    configs = list(_configs.values()) if _configs else []
    return {"configs": configs}


@router.put("/guard/config")
async def update_guard_config(config: GuardConfigUpdate):
    _configs[config.position_symbol] = config.model_dump()
    return _configs[config.position_symbol]


@router.get("/guard/status")
async def get_guard_status():
    return {
        "active": len(_configs) > 0 and any(c.get("guard_enabled") for c in _configs.values()),
        "monitoring_count": sum(1 for c in _configs.values() if c.get("guard_enabled")),
        "last_check": "2026-04-08T12:30:00Z",
    }
