// ============================================================
//  Funding Rate types
// ============================================================

export interface FundingRate {
  market: string;
  rate8h: number;
  annualizedApr: number;
  nextFundingTime: number;
  markPrice: number;
}

export interface FundingForecast {
  symbol: string;
  predictions: number[];
  confidence: {
    upper: number[];
    lower: number[];
  };
  generatedAt: string;
}

export interface FundingHistory {
  timestamp: number;
  rate: number;
}

export interface PositionCarry {
  symbol: string;
  direction: 'long' | 'short';
  size: number;
  carryPerEpoch: number;
  carryPerDay: number;
}

export type FundingTrend = 'rising' | 'falling' | 'stable';
