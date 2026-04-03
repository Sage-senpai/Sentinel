"""SENTINEL API — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import close_redis, get_redis
from app.routers import health, markets, alerts, positions, guard, whale, funding, hedge, referral


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle events."""
    r = await get_redis()
    if r:
        print("[SENTINEL] Redis connected")
    else:
        print("[SENTINEL] Redis not available — starting without cache")

    yield

    await close_redis()
    print("[SENTINEL] Shutdown complete")


app = FastAPI(
    title="SENTINEL API",
    description="AI-Powered Liquidation Defense & Whale Intelligence Platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sentinel.app",
        "https://staging.sentinel.app",
        "https://sentinel-lake.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(markets.router, prefix="/api/v1", tags=["Markets"])
app.include_router(alerts.router, prefix="/api/v1", tags=["Alerts"])
app.include_router(positions.router, prefix="/api/v1", tags=["Positions"])
app.include_router(guard.router, prefix="/api/v1", tags=["Guard"])
app.include_router(whale.router, prefix="/api/v1", tags=["Whale Intel"])
app.include_router(funding.router, prefix="/api/v1", tags=["Funding Rates"])
app.include_router(hedge.router, prefix="/api/v1", tags=["Africa Hedge"])
app.include_router(referral.router, prefix="/api/v1", tags=["Referral"])
