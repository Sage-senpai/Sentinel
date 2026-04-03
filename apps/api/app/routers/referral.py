"""SENTINEL Referral System — in-house replacement for Fuul.

Generates unique referral codes per wallet, tracks signups,
and awards points. 1,000 points = 1 month Pro free.
"""

import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()

# In-memory store (Phase 2+: move to PostgreSQL)
_referrals: dict[str, dict] = {}
_conversions: list[dict] = []


def _generate_code(wallet: str) -> str:
    """Deterministic short referral code from wallet address."""
    h = hashlib.sha256(wallet.lower().encode()).hexdigest()
    return f"SEN-{h[:8].upper()}"


@router.get("/referral/code")
async def get_referral_code(wallet: str):
    """Get or create a referral code for a wallet address."""
    code = _generate_code(wallet)

    if code not in _referrals:
        _referrals[code] = {
            "code": code,
            "wallet": wallet.lower(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "referral_count": 0,
            "points": 0,
        }

    return _referrals[code]


@router.get("/referral/stats")
async def get_referral_stats(wallet: str):
    """Get referral stats for a wallet."""
    code = _generate_code(wallet)
    ref = _referrals.get(code)

    if not ref:
        return {
            "code": code,
            "referral_count": 0,
            "points": 0,
            "tier_earned": None,
            "conversions": [],
        }

    return {
        "code": ref["code"],
        "referral_count": ref["referral_count"],
        "points": ref["points"],
        "tier_earned": "pro" if ref["points"] >= 1000 else None,
        "conversions": [
            c for c in _conversions if c["referrer_code"] == code
        ],
    }


@router.post("/referral/convert")
async def track_conversion(referral_code: str, new_wallet: str):
    """Track a new user signup via referral link."""
    ref = _referrals.get(referral_code)
    if not ref:
        return {"success": False, "error": "Invalid referral code"}

    # Check for duplicate
    for c in _conversions:
        if c["new_wallet"] == new_wallet.lower():
            return {"success": False, "error": "Wallet already referred"}

    conversion = {
        "referrer_code": referral_code,
        "referrer_wallet": ref["wallet"],
        "new_wallet": new_wallet.lower(),
        "points_awarded": 100,
        "converted_at": datetime.now(timezone.utc).isoformat(),
    }
    _conversions.append(conversion)

    ref["referral_count"] += 1
    ref["points"] += 100

    return {
        "success": True,
        "points_awarded": 100,
        "total_points": ref["points"],
        "tier_earned": "pro" if ref["points"] >= 1000 else None,
    }


@router.get("/referral/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Top referrers by points."""
    sorted_refs = sorted(
        _referrals.values(),
        key=lambda r: r["points"],
        reverse=True,
    )[:limit]

    return [
        {
            "wallet": f"{r['wallet'][:6]}...{r['wallet'][-4:]}",
            "code": r["code"],
            "referral_count": r["referral_count"],
            "points": r["points"],
        }
        for r in sorted_refs
    ]
