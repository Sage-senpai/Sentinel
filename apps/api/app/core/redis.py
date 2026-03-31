"""Redis client singleton."""

import redis.asyncio as aioredis

from app.core.config import settings

redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    """Return the global async Redis client, creating it if needed."""
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
            max_connections=20,
        )
    return redis_client


async def close_redis() -> None:
    """Gracefully close Redis connection pool."""
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None
