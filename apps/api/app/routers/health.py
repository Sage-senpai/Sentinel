"""Health check endpoints for monitoring."""

from fastapi import APIRouter

from app.core.redis import get_redis

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.get("/health/ws")
async def ws_health():
    # Will check WebSocket connection to Pacifica
    return {"connected": False, "message": "WebSocket not yet initialized"}


@router.get("/health/pacifica")
async def pacifica_health():
    # Will ping Pacifica API
    return {"reachable": False, "message": "Pacifica health check not yet implemented"}


@router.get("/health/redis")
async def redis_health():
    try:
        r = await get_redis()
        if r is None:
            return {"connected": False, "message": "Redis not configured"}
        pong = await r.ping()
        return {"connected": pong}
    except Exception as e:
        return {"connected": False, "error": str(e)}


@router.get("/health/agents")
async def agents_health():
    return {
        "all_healthy": False,
        "agents": {
            "guard": "stopped",
            "cascade_predictor": "stopped",
            "whale_intel": "stopped",
            "funding_forecast": "stopped",
            "africa_fx": "stopped",
            "alert_broadcast": "stopped",
        },
    }
