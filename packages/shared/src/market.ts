// ============================================================
//  Market types — Pacifica market data
// ============================================================

export interface Market {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  tickSize: number;
  lotSize: number;
  maxLeverage: number;
  status: 'active' | 'paused' | 'delisted';
}

export interface OrderbookLevel {
  price: number;
  size: number;
}

export interface Orderbook {
  symbol: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: number;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface LiquidationEvent {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  price: number;
  size: number;
  timestamp: number;
}
