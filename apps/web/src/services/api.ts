const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('API not configured');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ── Health ──────────────────────────────────────────────────
export const health = {
  check: () => request<{ status: string }>('/health'),
  agents: () => request<{ agents: Record<string, string> }>('/health/agents'),
  redis: () => request<{ status: string }>('/health/redis'),
};

// ── Markets ─────────────────────────────────────────────────
export interface MarketData {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  volume24h: number;
  status: string;
}

export const markets = {
  list: () => request<MarketData[]>('/api/v1/markets'),
  orderbook: (symbol: string) =>
    request<{ bids: number[][]; asks: number[][] }>(`/api/v1/markets/${symbol}/orderbook`),
};

// ── Alerts ──────────────────────────────────────────────────
export interface CascadePrediction {
  market: string;
  probability: number;
  severity: string;
  time_horizon: string;
  affected_range_low: number;
  affected_range_high: number;
  estimated_volume: number;
}

export interface Alert {
  id: string;
  module: string;
  market: string | null;
  severity: string | null;
  probability: number | null;
  action_taken: string | null;
  created_at: string;
}

export const alerts = {
  recent: () => request<Alert[]>('/api/v1/alerts'),
  cascade: () => request<CascadePrediction[]>('/api/v1/alerts/cascade'),
};

// ── Positions ───────────────────────────────────────────────
export interface Position {
  symbol: string;
  direction: string;
  size: number;
  entry_price: number;
  mark_price: number;
  margin_ratio: number;
  liquidation_price: number;
  health_score: number;
  unrealized_pnl: number;
}

export const positions = {
  open: () => request<Position[]>('/api/v1/positions'),
  history: () => request<Position[]>('/api/v1/positions/history'),
};

// ── Guard ───────────────────────────────────────────────────
export interface GuardConfig {
  position_symbol: string;
  guard_enabled: boolean;
  threshold_pct: number;
  action_type: string;
  partial_close_pct: number;
  max_spend_usd: number | null;
}

export const guard = {
  config: () => request<GuardConfig>('/api/v1/guard/config'),
  update: (config: Partial<GuardConfig>) =>
    request<GuardConfig>('/api/v1/guard/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  status: () => request<{ active: boolean; monitoring_count: number; last_check: string }>('/api/v1/guard/status'),
};

// ── Whale ───────────────────────────────────────────────────
export interface WhaleEvent {
  id: string;
  wallet_address: string;
  action_type: string;
  size_usd: number | null;
  market: string | null;
  intent: string | null;
  elfa_score: number | null;
  created_at: string;
}

export interface Convergence {
  market: string;
  direction: string;
  whale_count: number;
  total_size_usd: number;
  wallets: string[];
}

export const whale = {
  events: () => request<WhaleEvent[]>('/api/v1/whale/events'),
  convergence: () => request<Convergence[]>('/api/v1/whale/convergence'),
  watchlist: () => request<string[]>('/api/v1/whale/watchlist'),
};

// ── Funding ─────────────────────────────────────────────────
export interface FundingRate {
  market: string;
  rate_8h: number;
  annualized_apr: number;
  next_funding_time: string;
  mark_price: number;
}

export interface FundingForecast {
  symbol: string;
  predictions: number[];
  confidence_upper: number[];
  confidence_lower: number[];
}

export const funding = {
  rates: () => request<FundingRate[]>('/api/v1/funding/rates'),
  forecast: (symbol: string) => request<FundingForecast>(`/api/v1/funding/forecast/${symbol}`),
  history: (symbol: string, days = 30) =>
    request<{ timestamp: string; rate: number }[]>(`/api/v1/funding/history/${symbol}?days=${days}`),
};

// ── Hedge ───────────────────────────────────────────────────
export interface FxRate {
  currency: string;
  rate_to_usd: number;
  change_24h: number;
}

export interface HedgeResult {
  currency: string;
  short_size_btc: number;
  required_margin_usd: number;
  daily_carry_usd: number;
  daily_carry_local: number;
  recommendation: string;
}

// ── Referral ────────────────────────────────────────────────
export interface ReferralInfo {
  code: string;
  wallet: string;
  referral_count: number;
  points: number;
  created_at: string;
}

export interface ReferralStats {
  code: string;
  referral_count: number;
  points: number;
  tier_earned: string | null;
  conversions: { new_wallet: string; points_awarded: number; converted_at: string }[];
}

export interface ConversionResult {
  success: boolean;
  error?: string;
  points_awarded?: number;
  total_points?: number;
  tier_earned?: string | null;
}

export interface LeaderboardEntry {
  wallet: string;
  code: string;
  referral_count: number;
  points: number;
}

export const referral = {
  getCode: (wallet: string) =>
    request<ReferralInfo>(`/api/v1/referral/code?wallet=${wallet}`),
  stats: (wallet: string) =>
    request<ReferralStats>(`/api/v1/referral/stats?wallet=${wallet}`),
  convert: (referralCode: string, newWallet: string) =>
    request<ConversionResult>(
      `/api/v1/referral/convert?referral_code=${referralCode}&new_wallet=${newWallet}`,
      { method: 'POST' }
    ),
  leaderboard: (limit = 10) =>
    request<LeaderboardEntry[]>(`/api/v1/referral/leaderboard?limit=${limit}`),
};

export const hedge = {
  rates: () => request<FxRate[]>('/api/v1/hedge/rates'),
  calculate: (params: {
    currency: string;
    portfolio_value_usd: number;
    hedge_ratio: number;
    duration_days: number;
  }) =>
    request<HedgeResult>('/api/v1/hedge/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};
