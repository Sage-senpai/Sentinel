// ============================================================
//  Alert types — cascade predictions and notifications
// ============================================================

export type AlertSeverity = 'WATCH' | 'ALERT' | 'CASCADE_IMMINENT';
export type AlertModule = 'cascade' | 'whale' | 'guard' | 'funding' | 'africa';

export interface CascadePrediction {
  market: string;
  probability: number;
  severity: AlertSeverity;
  timeHorizon: '5min' | '15min' | '60min';
  affectedRange: {
    low: number;
    high: number;
  };
  estimatedVolume: number;
  onchainTxHash?: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  userId?: string;
  module: AlertModule;
  market?: string;
  severity?: AlertSeverity;
  probability?: number;
  actionTaken?: string;
  orderId?: string;
  executionPrice?: number;
  onchainTxHash?: string;
  fuulLink?: string;
  createdAt: string;
}
