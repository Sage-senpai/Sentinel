// ============================================================
//  Africa FX Hedge types
// ============================================================

export type AfricaCurrency = 'NGN' | 'KES' | 'GHS';

export interface FxRate {
  currency: AfricaCurrency;
  rateToUsd: number;
  change24h: number;
  updatedAt: string;
}

export interface HedgeRecommendation {
  currency: AfricaCurrency;
  portfolioValueUsd: number;
  hedgeRatio: number;
  shortSizeBtc: number;
  requiredMarginUsd: number;
  leverage: number;
  dailyCarryUsd: number;
  dailyCarryLocal: number;
  totalCostUsd: number;
  durationDays: number;
  recommendation: string;
}
