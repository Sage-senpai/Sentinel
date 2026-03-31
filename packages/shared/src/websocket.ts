// ============================================================
//  WebSocket event types — Pacifica WS subscriptions
// ============================================================

export type WSChannel =
  | 'liquidations'
  | 'orderbook'
  | 'funding'
  | 'trades'
  | 'positions';

export interface WSSubscription {
  channel: WSChannel;
  symbol?: string;
}

export interface WSMessage<T = unknown> {
  channel: WSChannel;
  event: string;
  data: T;
  timestamp: number;
}

export interface WSLiquidationEvent {
  symbol: string;
  side: 'long' | 'short';
  price: number;
  size: number;
  notionalValue: number;
}

export interface WSOrderbookUpdate {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  sequence: number;
}

export interface WSFundingUpdate {
  symbol: string;
  rate: number;
  nextFundingTime: number;
  markPrice: number;
}

export interface WSTradeEvent {
  symbol: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export interface WSPositionUpdate {
  symbol: string;
  direction: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  marginRatio: number;
  liquidationPrice: number;
  unrealizedPnl: number;
}
