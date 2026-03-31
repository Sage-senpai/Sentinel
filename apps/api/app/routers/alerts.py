"""Alerts router — cascade predictions and alert history."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/alerts")
async def get_alerts():
    """Return recent alerts from all modules."""
    return {"alerts": []}


@router.get("/alerts/cascade")
async def get_cascade_prediction():
    """Return current cascade prediction for all markets."""
    return {
        "predictions": [],
        "message": "Cascade predictor not yet running",
    }
