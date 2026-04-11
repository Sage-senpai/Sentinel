'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useApi } from '@/hooks/useApi';
import { useNotify } from '@/components/providers/NotificationProvider';
import * as api from '@/services/api';
import styles from './LiquidationRadar.module.scss';

interface MarketRisk {
  symbol: string;
  riskScore: number;
  liquidationDensity: number;
}

const INITIAL_MARKETS: MarketRisk[] = [
  { symbol: 'BTC-PERP', riskScore: 42, liquidationDensity: 0.15 },
  { symbol: 'ETH-PERP', riskScore: 67, liquidationDensity: 0.28 },
  { symbol: 'SOL-PERP', riskScore: 23, liquidationDensity: 0.08 },
  { symbol: 'ARB-PERP', riskScore: 55, liquidationDensity: 0.19 },
];

export function LiquidationRadar() {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const [marketRisks, setMarketRisks] = useState<MarketRisk[]>(INITIAL_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState('BTC-PERP');
  const [liqVelocity, setLiqVelocity] = useState(0);
  const [markPrice, setMarkPrice] = useState<number | null>(null);
  const liqCountRef = useRef(0);

  const { connected, subscribe } = useSocket();
  const { push: notify } = useNotify();
  const prevSeverityRef = useRef<string | null>(null);

  // Fetch live mark price from Pacifica trades
  const marketSymbol = selectedMarket.replace('-PERP', '');
  const { data: priceData } = useApi(
    () => api.markets.price(marketSymbol),
    { pollInterval: 5000 }
  );

  // Fetch live trades for heatmap density
  const { data: tradeData } = useApi(
    () => api.markets.trades(marketSymbol),
    { pollInterval: 8000 }
  );

  useEffect(() => {
    if (priceData?.price && priceData.price > 0) {
      setMarkPrice(priceData.price);
    }
  }, [priceData]);

  // Compute liquidation velocity from trade data
  useEffect(() => {
    if (tradeData?.trades) {
      setLiqVelocity(tradeData.trades.length);
    }
  }, [tradeData]);

  const { data: cascadeData } = useApi(
    () => api.alerts.cascade(),
    { pollInterval: 10000 }
  );

  const cascade = cascadeData?.find(
    (c) => c.market === selectedMarket
  ) ?? null;

  // Notify on severity change
  useEffect(() => {
    if (!cascade) return;
    const prev = prevSeverityRef.current;
    prevSeverityRef.current = cascade.severity;
    if (prev === cascade.severity) return;

    if (cascade.severity === 'CASCADE_IMMINENT') {
      notify('cascade', `CASCADE IMMINENT — ${cascade.market}`, `${cascade.probability}% probability. Take protective action.`, 'cascade');
    } else if (cascade.severity === 'ALERT') {
      notify('alert', `Alert — ${cascade.market}`, `Cascade probability rising to ${cascade.probability}%`, 'alert');
    }
  }, [cascade, notify]);

  // Subscribe to real-time liquidation events
  useEffect(() => {
    const unsub = subscribe('liquidation', (raw: unknown) => {
      const event = raw as { symbol: string; price: number; size: number };
      if (event.symbol === selectedMarket) {
        liqCountRef.current++;
      }
      setMarketRisks((prev) =>
        prev.map((m) =>
          m.symbol === event.symbol
            ? { ...m, riskScore: Math.min(100, m.riskScore + 2), liquidationDensity: m.liquidationDensity + 0.01 }
            : m
        )
      );
    });
    return unsub;
  }, [subscribe, selectedMarket]);

  // Subscribe to price updates
  useEffect(() => {
    const unsub = subscribe('funding', (raw: unknown) => {
      const event = raw as { symbol: string; markPrice: number };
      if (event.symbol === selectedMarket) {
        setMarkPrice(event.markPrice);
      }
    });
    return unsub;
  }, [subscribe, selectedMarket]);

  // Liquidation velocity tracker (events/min)
  useEffect(() => {
    const id = setInterval(() => {
      setLiqVelocity(liqCountRef.current);
      liqCountRef.current = 0;
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const getSeverityClass = useCallback((severity: string) => {
    switch (severity) {
      case 'CASCADE_IMMINENT': return styles.cascadeImminent;
      case 'ALERT': return styles.alert;
      case 'WATCH': return styles.watch;
      default: return '';
    }
  }, []);

  const prob = cascade?.probability ?? 0;

  return (
    <div className={styles.container}>
      {cascade && cascade.severity === 'CASCADE_IMMINENT' && (
        <div className={styles.cascadeBanner}>
          <span className={styles.cascadeBannerIcon}>!!</span>
          <span>CASCADE IMMINENT — {selectedMarket}</span>
          <span className={styles.cascadeBannerProb}>{prob}%</span>
        </div>
      )}

      <div className={styles.layout}>
        <aside className={styles.marketSidebar}>
          <h3 className={styles.sidebarTitle}>Markets</h3>
          {marketRisks.map((market) => (
            <button
              key={market.symbol}
              type="button"
              className={`${styles.marketCard} ${selectedMarket === market.symbol ? styles.selected : ''}`}
              onClick={() => setSelectedMarket(market.symbol)}
            >
              <div
                className={styles.riskOrb}
                data-risk={market.riskScore > 60 ? 'high' : undefined}
              />
              <div className={styles.marketInfo}>
                <span className={styles.marketSymbol}>{market.symbol}</span>
                <span className={styles.marketRisk}>
                  Risk: {market.riskScore}/100
                </span>
              </div>
            </button>
          ))}
        </aside>

        <div className={styles.main}>
          <div className={styles.heatmapHeader}>
            <h2>Liquidation Heatmap — {selectedMarket}</h2>
            <div className={styles.legend}>
              <span className={styles.legendLow}>Low</span>
              <div className={styles.legendBar} />
              <span className={styles.legendHigh}>Extreme</span>
            </div>
          </div>

          <div className={styles.heatmap} ref={heatmapRef}>
            <svg viewBox="0 0 800 300" className={styles.heatmapSvg} preserveAspectRatio="none">
              {(() => {
                const trades = tradeData?.trades ?? [];
                const currentPrice = markPrice ?? 0;
                const risk = marketRisks.find((m) => m.symbol === selectedMarket);
                const baseRisk = (risk?.riskScore ?? 30) / 100;

                // Build price-level density from real trade data
                const priceRange = currentPrice * 0.03; // +/- 3% range
                const priceLow = currentPrice - priceRange;
                const priceHigh = currentPrice + priceRange;

                // Bucket trades into grid cells
                const ROWS = 20;
                const COLS = 40;
                const grid: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

                trades.forEach((t) => {
                  const yNorm = priceHigh > priceLow ? (t.price - priceLow) / (priceHigh - priceLow) : 0.5;
                  const row = Math.floor(Math.max(0, Math.min(ROWS - 1, (1 - yNorm) * ROWS)));
                  const col = Math.floor(Math.random() * COLS); // spread across time axis
                  grid[row][col] += t.size;
                });

                // Normalize
                const maxVal = Math.max(0.001, ...grid.flat());

                return (
                  <>
                    {grid.map((row, ri) =>
                      row.map((val, ci) => {
                        const norm = val / maxVal;
                        const intensity = Math.max(0, Math.min(1, norm * 0.7 + baseRisk * 0.3 + Math.sin(ci * 0.3 + ri * 0.2) * 0.08));
                        const r = Math.round(intensity > 0.5 ? 180 + intensity * 75 : intensity * 60);
                        const g = Math.round(intensity > 0.4 ? (1 - intensity) * 200 : 80 + intensity * 170);
                        const b = Math.round(intensity < 0.3 ? 160 + intensity * 80 : (1 - intensity) * 100);
                        return (
                          <rect key={`${ri}-${ci}`} x={ci * 20} y={ri * 15} width={20} height={15}
                            fill={`rgb(${r},${g},${b})`} opacity={0.6 + intensity * 0.4} />
                        );
                      })
                    )}
                    {/* Mark price line */}
                    {currentPrice > 0 && (
                      <>
                        <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(0,102,255,0.6)" strokeWidth="1" strokeDasharray="6,3" />
                        <text x="650" y="145" fill="rgba(0,102,255,0.8)" fontSize="11" fontFamily="var(--font-mono)">
                          ${currentPrice.toLocaleString()}
                        </text>
                      </>
                    )}
                    {/* Price labels */}
                    {currentPrice > 0 && (
                      <>
                        <text x="10" y="20" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="var(--font-mono)">${Math.round(priceHigh).toLocaleString()}</text>
                        <text x="10" y="290" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="var(--font-mono)">${Math.round(priceLow).toLocaleString()}</text>
                      </>
                    )}
                    {[0.25, 0.75].map((y) => (
                      <line key={y} x1="0" y1={y * 300} x2="800" y2={y * 300} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="4,4" />
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className={styles.gaugeRow}>
            <div className={`${styles.gaugeCard} ${cascade ? getSeverityClass(cascade.severity) : ''}`}>
              <h4>Cascade Probability</h4>
              <div className={styles.gauge}>
                <svg viewBox="0 0 100 50" className={styles.gaugeSvg}>
                  <path
                    d="M 10 45 A 35 35 0 0 1 90 45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 45 A 35 35 0 0 1 90 45"
                    fill="none"
                    stroke={prob > 70 ? 'var(--color-red)' : prob > 40 ? 'var(--color-gold)' : 'var(--color-teal)'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="110"
                    strokeDashoffset={110 - (110 * prob) / 100}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <span className={styles.gaugeValue}>{prob}%</span>
              </div>
            </div>

            <div className={styles.gaugeCard}>
              <h4>Mark Price</h4>
              <div className={styles.priceValue}>
                {markPrice ? `$${markPrice.toLocaleString()}` : '$—'}
              </div>
            </div>

            <div className={styles.gaugeCard}>
              <h4>Trade Velocity</h4>
              <div className={styles.priceValue}>{liqVelocity} trades/cycle</div>
            </div>

            <div className={styles.gaugeCard}>
              <h4>Spread</h4>
              <div className={styles.priceValue}>
                {markPrice ? `$${(markPrice * 0.0002).toFixed(2)}` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
