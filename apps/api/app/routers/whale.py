"""Whale Intelligence — live Elfa AI data with demo fallback."""

import httpx
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

ELFA_BASE = "https://api.elfa.ai/v2"

DEMO_EVENTS = [
    {"id": "w1", "wallet_address": "0x7a16fF8270133F063aAb6C9977183D9e72835428", "action_type": "long_open", "size_usd": 2400000, "market": "BTC", "intent": "ACCUMULATING", "elfa_score": 8.7, "created_at": "2026-04-08T12:28:00Z"},
    {"id": "w2", "wallet_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7", "action_type": "short_open", "size_usd": 1850000, "market": "ETH", "intent": "DISTRIBUTING", "elfa_score": 7.2, "created_at": "2026-04-08T12:22:00Z"},
    {"id": "w3", "wallet_address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "action_type": "long_open", "size_usd": 890000, "market": "BTC", "intent": "ACCUMULATING", "elfa_score": 6.9, "created_at": "2026-04-08T12:18:00Z"},
    {"id": "w4", "wallet_address": "0x6B175474E89094C44Da98b954EedeAC495271d0F", "action_type": "close", "size_usd": 3100000, "market": "SOL", "intent": "HEDGING", "elfa_score": 9.1, "created_at": "2026-04-08T12:10:00Z"},
    {"id": "w5", "wallet_address": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", "action_type": "long_open", "size_usd": 1250000, "market": "BTC", "intent": "ACCUMULATING", "elfa_score": 7.8, "created_at": "2026-04-08T12:05:00Z"},
    {"id": "w6", "wallet_address": "0x514910771AF9Ca656af840dff83E8264EcF986CA", "action_type": "short_open", "size_usd": 620000, "market": "ARB", "intent": "ARBITRAGE", "elfa_score": 5.4, "created_at": "2026-04-08T11:58:00Z"},
]


@router.get("/whale/events")
async def get_whale_events():
    """Fetch trending token mentions from Elfa AI as whale intel proxy."""
    if settings.elfa_api_key:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                # Get top BTC mentions (whale-grade social signals)
                res = await client.get(
                    f"{ELFA_BASE}/data/top-mentions",
                    params={"ticker": "BTC", "timeWindow": "24h", "limit": 10},
                    headers={"x-elfa-api-key": settings.elfa_api_key},
                )
                if res.status_code == 200:
                    data = res.json()
                    if data.get("success") and data.get("data"):
                        mentions = data["data"]
                        events = []
                        for i, m in enumerate(mentions[:10]):
                            score = min(10, (m.get("likeCount", 0) + m.get("repostCount", 0) * 3) / 5000)
                            events.append({
                                "id": f"elfa-{i}",
                                "wallet_address": m.get("link", f"0x{i:040x}"),
                                "action_type": "signal",
                                "size_usd": m.get("viewCount", 0),
                                "market": "BTC",
                                "intent": "ACCUMULATING" if m.get("repostCount", 0) > 500 else "UNKNOWN",
                                "elfa_score": round(score, 1),
                                "created_at": m.get("mentionedAt", ""),
                            })
                        if events:
                            return {"events": events, "source": "elfa_ai_live"}
        except Exception:
            pass
    return {"events": DEMO_EVENTS, "source": "demo"}


@router.get("/whale/convergence")
async def get_convergence():
    """Get trending tokens as convergence signals from Elfa AI."""
    if settings.elfa_api_key:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                res = await client.get(
                    f"{ELFA_BASE}/aggregations/trending-tokens",
                    params={"timeWindow": "24h", "limit": 10},
                    headers={"x-elfa-api-key": settings.elfa_api_key},
                )
                if res.status_code == 200:
                    data = res.json()
                    tokens = data.get("data", {}).get("data", [])
                    # Find tokens with significant growth (convergence signal)
                    convergences = []
                    for t in tokens[:5]:
                        change = t.get("change_percent", 0)
                        if change > 20:
                            convergences.append({
                                "market": t["token"].upper(),
                                "direction": "long" if change > 0 else "short",
                                "whale_count": t.get("current_count", 0),
                                "total_size_usd": t.get("current_count", 0) * 100000,
                                "wallets": [],
                            })
                    if convergences:
                        return {"alerts": convergences, "source": "elfa_ai_live"}
        except Exception:
            pass
    return {
        "alerts": [
            {"market": "BTC", "direction": "long", "whale_count": 3, "total_size_usd": 4540000, "wallets": ["0x7a16..5428", "0xA0b8..eB48", "0x2260..C599"]}
        ],
        "source": "demo",
    }


@router.get("/whale/watchlist")
async def get_watchlist():
    return {"wallets": []}
