// ============================================================
//  Whale Intelligence types
// ============================================================

export type WhaleIntent =
  | 'ACCUMULATING'
  | 'DISTRIBUTING'
  | 'HEDGING'
  | 'ARBITRAGE'
  | 'UNKNOWN';

export type WhaleActionType =
  | 'long_open'
  | 'short_open'
  | 'close'
  | 'limit';

export interface WhaleEvent {
  id: string;
  walletAddress: string;
  actionType: WhaleActionType;
  sizeUsd: number;
  market: string;
  intent: WhaleIntent;
  elfaScore: number;
  createdAt: string;
}

export interface SmartMoneyConvergence {
  market: string;
  direction: 'long' | 'short';
  whaleCount: number;
  totalSizeUsd: number;
  wallets: string[];
  windowMinutes: number;
  detectedAt: string;
}
