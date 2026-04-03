"""Redis client singleton — gracefully handles missing Redis."""

import redis.asyncio as aioredis

from app.core.config import settings

redis_client: aioredis.Redis | None = None
_redis_available = False


async def get_redis() -> aioredis.Redis | None:
    """Return the global async Redis client, or None if unavailable."""
    global redis_client, _redis_available
    if not settings.redis_url:
        return None
    if redis_client is None:
        try:
            redis_client = aioredis.from_url(
                settings.redis_url,
                decode_responses=True,
                max_connections=20,
            )
            await redis_client.ping()
            _redis_available = True
        except Exception:
            redis_client = None
            _redis_available = False
    return redis_client


def is_redis_available() -> bool:
    return _redis_available


async def close_redis() -> None:
    """Gracefully close Redis connection pool."""
    global redis_client, _redis_available
    if redis_client is not None:
        try:
            await redis_client.close()
        except Exception:
            pass
        redis_client = None
        _redis_available = False
