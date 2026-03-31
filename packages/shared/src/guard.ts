// ============================================================
//  SENTINEL Guard types
// ============================================================

export type GuardActionType = 'partial_close' | 'full_close' | 'add_margin';

export interface Position {
  symbol: string;
  direction: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  marginRatio: number;
  liquidationPrice: number;
  healthScore: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface GuardConfig {
  id: string;
  positionSymbol: string;
  guardEnabled: boolean;
  thresholdPct: number;
  actionType: GuardActionType;
  partialClosePct: number;
  maxSpendUsd?: number;
}

export interface GuardAction {
  id: string;
  timestamp: string;
  action: GuardActionType;
  market: string;
  details: string;
  orderId?: string;
  executionPrice?: number;
  status: 'success' | 'failed' | 'pending';
}
