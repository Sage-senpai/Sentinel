"""Alerts router — cascade predictions with demo fallback."""

from fastapi import APIRouter

router = APIRouter()

DEMO_PREDICTIONS = [
    {"market": "BTC-PERP", "probability": 23, "severity": "WATCH", "time_horizon": "15min", "affected_range_low": 64200, "affected_range_high": 65800, "estimated_volume": 12500000},
    {"market": "ETH-PERP", "probability": 61, "severity": "ALERT", "time_horizon": "5min", "affected_range_low": 3180, "affected_range_high": 3340, "estimated_volume": 8700000},
    {"market": "SOL-PERP", "probability": 12, "severity": "WATCH", "time_horizon": "60min", "affected_range_low": 142, "affected_range_high": 158, "estimated_volume": 3200000},
    {"market": "ARB-PERP", "probability": 45, "severity": "ALERT", "time_horizon": "15min", "affected_range_low": 1.02, "affected_range_high": 1.18, "estimated_volume": 1800000},
]

DEMO_ALERTS = [
    {"id": "a1", "module": "cascade", "market": "ETH-PERP", "severity": "ALERT", "probability": 61, "action_taken": None, "created_at": "2026-04-08T12:30:00Z"},
    {"id": "a2", "module": "whale", "market": "BTC-PERP", "severity": "WATCH", "probability": None, "action_taken": None, "created_at": "2026-04-08T12:25:00Z"},
    {"id": "a3", "module": "guard", "market": "SOL-PERP", "severity": "ALERT", "probability": None, "action_taken": "partial_close", "created_at": "2026-04-08T12:15:00Z"},
]


@router.get("/alerts")
async def get_alerts():
    return {"alerts": DEMO_ALERTS}


@router.get("/alerts/cascade")
async def get_cascade_predictions():
    return {"predictions": DEMO_PREDICTIONS}
