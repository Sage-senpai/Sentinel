'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useApi } from '@/hooks/useApi';
import * as api from '@/services/api';
import styles from './FundingRateDashboard.module.scss';

interface FundingRateUI {
  market: string;
  rate8h: number;
  annualizedApr: number;
  predicted: number[];
  trend: 'rising' | 'falling' | 'stable';
}

interface PositionCarry {
  symbol: string;
  direction: 'long' | 'short';
  size: number;
  carryPerEpoch: number;
  carryPerDay: number;
}

export function FundingRateDashboard() {
  const [rates, setRates] = useState<FundingRateUI[]>([]);
  const [carries] = useState<PositionCarry[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  const { subscribe } = useSocket();

  const { data: apiRates } = useApi(() => api.funding.rates(), { pollInterval: 30000 });
  const { data: forecast } = useApi(
    () => selectedMarket ? api.funding.forecast(selectedMarket) : Promise.resolve(null),
    { pollInterval: 60000, enabled: !!selectedMarket }
  );

  useEffect(() => {
    if (apiRates) {
      setRates(apiRates.map((r) => {
        const apr = r.annualized_apr;
        let trend: 'rising' | 'falling' | 'stable' = 'stable';
        if (apr > 5) trend = 'rising';
        else if (apr < -5) trend = 'falling';

        return {
          market: r.market,
          rate8h: r.rate_8h,
          annualizedApr: apr,
          predicted: forecast?.symbol === r.market ? forecast.predictions : [],
          trend,
        };
      }));
    }
  }, [apiRates, forecast]);

  // Real-time funding updates
  useEffect(() => {
    const unsub = subscribe('funding', (raw: unknown) => {
      const event = raw as { symbol: string; rate: number; markPrice: number };
      setRates((prev) =>
        prev.map((r) =>
          r.market === event.symbol
            ? { ...r, rate8h: event.rate, annualizedApr: event.rate * 3 * 365 * 100 }
            : r
        )
      );
    });
    return unsub;
  }, [subscribe]);

  const formatRate = (rate: number): string => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${(rate * 100).toFixed(4)}%`;
  };

  const formatApr = (apr: number): string => {
    const sign = apr >= 0 ? '+' : '';
    return `${sign}${apr.toFixed(2)}%`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Funding Rate Intelligence</h2>
        <p className={styles.subtitle}>Live rates, 4-epoch forecast, and carry cost analysis</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.tableSection}>
          <h3>Live Funding Rates</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>8h Rate</th>
                  <th>Annualized APR</th>
                  <th>Trend</th>
                  <th>Next Predicted</th>
                </tr>
              </thead>
              <tbody>
                {rates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>Loading funding rates from Pacifica...</td>
                  </tr>
                ) : (
                  rates.map((r) => (
                    <tr
                      key={r.market}
                      className={`${styles.row} ${selectedMarket === r.market ? styles.selectedRow : ''}`}
                      onClick={() => setSelectedMarket(r.market)}
                    >
                      <td className={styles.marketCell}>{r.market}</td>
                      <td className={`${styles.rateCell} ${r.rate8h >= 0 ? styles.positive : styles.negative}`}>
                        {formatRate(r.rate8h)}
                      </td>
                      <td className={`${styles.aprCell} ${r.annualizedApr >= 0 ? styles.positive : styles.negative}`}>
                        {formatApr(r.annualizedApr)}
                      </td>
                      <td className={styles.trendCell}>
                        <span className={styles[r.trend]}>
                          {r.trend === 'rising' ? '\u2191' : r.trend === 'falling' ? '\u2193' : '\u2192'}
                        </span>
                      </td>
                      <td className={styles.rateCell}>
                        {r.predicted[0] ? formatRate(r.predicted[0]) : '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3>
            {selectedMarket ? `${selectedMarket} — 30-Day History & Forecast` : 'Select a market to view forecast'}
          </h3>
          <div className={styles.chartPlaceholder}>
            {selectedMarket ? 'Chart rendering with D3.js...' : 'Click a market row to view historical and predicted rates'}
          </div>
        </div>

        {carries.length > 0 && (
          <div className={styles.carrySection}>
            <h3>Your Position Carry Costs</h3>
            <div className={styles.carryGrid}>
              {carries.map((c) => (
                <div key={c.symbol} className={styles.carryCard}>
                  <div className={styles.carrySymbol}>{c.symbol}</div>
                  <div className={styles.carryMetrics}>
                    <div className={styles.carryMetric}>
                      <span className={styles.carryLabel}>Per Epoch (8h)</span>
                      <span className={`${styles.carryValue} ${c.carryPerEpoch >= 0 ? styles.positive : styles.negative}`}>
                        {c.carryPerEpoch >= 0 ? '+' : ''}${c.carryPerEpoch.toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.carryMetric}>
                      <span className={styles.carryLabel}>Per Day</span>
                      <span className={`${styles.carryValue} ${c.carryPerDay >= 0 ? styles.positive : styles.negative}`}>
                        {c.carryPerDay >= 0 ? '+' : ''}${c.carryPerDay.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
