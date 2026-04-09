"""Health check endpoints."""

import httpx
from fastapi import APIRouter
from app.core.config import settings
from app.core.redis import get_redis, is_redis_available

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}


@router.get("/health/ws")
async def ws_health():
    return {"status": "not_initialized", "message": "WebSocket server not yet running"}


@router.get("/health/pacifica")
async def pacifica_health():
    """Test Pacifica testnet API reachability."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{settings.pacifica_api_url}/info")
            if res.status_code == 200:
                data = res.json()
                market_count = len(data.get("data", []))
                return {"status": "ok", "markets": market_count, "url": settings.pacifica_api_url}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    return {"status": "error", "message": "Unexpected response"}


@router.get("/health/redis")
async def redis_health():
    if not is_redis_available():
        return {"status": "not_configured"}
    try:
        r = await get_redis()
        if r:
            await r.ping()
            return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    return {"status": "unavailable"}


@router.get("/health/agents")
async def agent_health():
    return {
        "agents": {
            "guard": "stopped",
            "cascade_predictor": "stopped",
            "whale_intel": "stopped",
            "funding_forecast": "stopped",
            "africa_fx": "stopped",
            "alert_broadcast": "stopped",
        }
    }
