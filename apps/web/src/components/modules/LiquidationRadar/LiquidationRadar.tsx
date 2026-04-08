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
            <div className={styles.heatmapPlaceholder}>
              {connected ? 'Receiving liquidation data...' : 'Connecting to Pacifica WebSocket...'}
            </div>
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
              <h4>Liquidation Velocity</h4>
              <div className={styles.priceValue}>{liqVelocity} events/min</div>
            </div>

            <div className={styles.gaugeCard}>
              <h4>Your Liq. Distance</h4>
              <div className={styles.priceValue}>—</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
