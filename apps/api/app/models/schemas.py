"""Pydantic schemas for API request/response models."""

from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    privy_id: str
    wallet_address: str | None
    tier: str
    points: int
    home_module: str
    created_at: datetime


class BotConfigResponse(BaseModel):
    id: str
    position_symbol: str
    guard_enabled: bool
    threshold_pct: float
    action_type: str
    partial_close_pct: float
    max_spend_usd: float | None


class AlertResponse(BaseModel):
    id: str
    module: str
    market: str | None
    severity: str | None
    probability: float | None
    action_taken: str | None
    order_id: str | None
    execution_price: float | None
    onchain_tx_hash: str | None
    fuul_link: str | None
    created_at: datetime


class WhaleEventResponse(BaseModel):
    id: str
    wallet_address: str
    action_type: str
    size_usd: float | None
    market: str | None
    intent: str | None
    elfa_score: float | None
    created_at: datetime


class CascadePredictionResponse(BaseModel):
    market: str
    probability: float
    severity: str
    time_horizon: str
    affected_range_low: float
    affected_range_high: float
    estimated_volume: float


class FundingForecastResponse(BaseModel):
    symbol: str
    predictions: list[float]
    confidence_upper: list[float]
    confidence_lower: list[float]


class HedgeRecommendation(BaseModel):
    currency: str
    short_size_btc: float
    required_margin_usd: float
    daily_carry_usd: float
    daily_carry_local: float
    recommendation: str
