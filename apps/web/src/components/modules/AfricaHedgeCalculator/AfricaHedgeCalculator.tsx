'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import * as api from '@/services/api';
import styles from './AfricaHedgeCalculator.module.scss';

type Currency = 'NGN' | 'KES' | 'GHS';

interface CurrencyMeta {
  currency: Currency;
  rate: number;
  change24h: number;
  flag: string;
  name: string;
}

const DEFAULT_CURRENCIES: CurrencyMeta[] = [
  { currency: 'NGN', rate: 0, change24h: 0, flag: '\uD83C\uDDF3\uD83C\uDDEC', name: 'Nigerian Naira' },
  { currency: 'KES', rate: 0, change24h: 0, flag: '\uD83C\uDDF0\uD83C\uDDEA', name: 'Kenyan Shilling' },
  { currency: 'GHS', rate: 0, change24h: 0, flag: '\uD83C\uDDEC\uD83C\uDDED', name: 'Ghanaian Cedi' },
];

export function AfricaHedgeCalculator() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('NGN');
  const [portfolioValue, setPortfolioValue] = useState<string>('');
  const [hedgeRatio, setHedgeRatio] = useState(50);
  const [duration, setDuration] = useState(30);
  const [rates, setRates] = useState<CurrencyMeta[]>(DEFAULT_CURRENCIES);
  const [apiHedge, setApiHedge] = useState<api.HedgeResult | null>(null);

  // Fetch live FX rates
  const { data: fxRates } = useApi(() => api.hedge.rates(), { pollInterval: 60000 });

  useEffect(() => {
    if (fxRates) {
      setRates((prev) =>
        prev.map((c) => {
          const live = fxRates.find((f) => f.currency === c.currency);
          return live ? { ...c, rate: live.rate_to_usd, change24h: live.change_24h } : c;
        })
      );
    }
  }, [fxRates]);

  const selectedRate = useMemo(
    () => rates.find((r) => r.currency === selectedCurrency),
    [rates, selectedCurrency],
  );

  // Calculate hedge via API when inputs change
  const calculateHedge = useCallback(async () => {
    const valueUsd = parseFloat(portfolioValue);
    if (!valueUsd || valueUsd <= 0) { setApiHedge(null); return; }

    try {
      const result = await api.hedge.calculate({
        currency: selectedCurrency,
        portfolio_value_usd: valueUsd,
        hedge_ratio: hedgeRatio / 100,
        duration_days: duration,
      });
      setApiHedge(result);
    } catch {
      // Fall back to local calculation
      setApiHedge(null);
    }
  }, [portfolioValue, selectedCurrency, hedgeRatio, duration]);

  useEffect(() => {
    const timeout = setTimeout(calculateHedge, 500);
    return () => clearTimeout(timeout);
  }, [calculateHedge]);

  // Local fallback calculation
  const localResult = useMemo(() => {
    const valueUsd = parseFloat(portfolioValue);
    if (!valueUsd || !selectedRate) return null;

    const hedgeAmount = valueUsd * (hedgeRatio / 100);
    const btcPrice = 65000;
    const shortSize = hedgeAmount / btcPrice;
    const requiredMargin = hedgeAmount / 2;
    const fundingRate = 0.0001;
    const dailyCarry = hedgeAmount * fundingRate * 3;
    const dailyCarryLocal = selectedRate.rate > 0 ? dailyCarry * selectedRate.rate : 0;

    return {
      shortSize,
      requiredMargin,
      dailyCarry,
      dailyCarryLocal,
      recommendation: `Short ${shortSize.toFixed(4)} BTC-PERP at 2x leverage.\nRequired margin: $${requiredMargin.toFixed(0)} USDC.\nDaily carry: ${dailyCarry >= 0 ? '+' : ''}$${dailyCarry.toFixed(2)}`,
    };
  }, [portfolioValue, hedgeRatio, selectedRate]);

  const hedge = apiHedge ? {
    shortSize: apiHedge.short_size_btc,
    requiredMargin: apiHedge.required_margin_usd,
    dailyCarry: apiHedge.daily_carry_usd,
    dailyCarryLocal: apiHedge.daily_carry_local,
    recommendation: apiHedge.recommendation,
  } : localResult;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Africa FX Hedge Calculator</h2>
        <p className={styles.subtitle}>Protect portfolio value against local currency depreciation</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.inputSection}>
          <div className={styles.currencySelector}>
            <h4>Select Currency</h4>
            <div className={styles.currencyGrid}>
              {rates.map((r) => (
                <button
                  key={r.currency}
                  type="button"
                  className={`${styles.currencyCard} ${selectedCurrency === r.currency ? styles.selectedCurrency : ''}`}
                  onClick={() => setSelectedCurrency(r.currency)}
                >
                  <span className={styles.flag}>{r.flag}</span>
                  <span className={styles.currencyCode}>{r.currency}</span>
                  <span className={styles.currencyName}>{r.name}</span>
                  <span className={styles.fxRate}>
                    {r.rate > 0 ? `$1 = ${r.rate.toFixed(2)}` : 'Loading...'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="portfolio-value">Portfolio Value (USD)</label>
            <input
              id="portfolio-value"
              type="number"
              className={styles.input}
              placeholder="e.g. 50000"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="hedge-ratio">Hedge Ratio: {hedgeRatio}%</label>
            <input
              id="hedge-ratio"
              type="range"
              className={styles.slider}
              min="25" max="100" step="5"
              value={hedgeRatio}
              onChange={(e) => setHedgeRatio(Number(e.target.value))}
            />
            <div className={styles.sliderLabels}>
              <span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="duration">Duration (days)</label>
            <input
              id="duration"
              type="number"
              className={styles.input}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.resultSection}>
          {hedge ? (
            <div className={styles.resultCard}>
              <h3>Hedge Recommendation</h3>
              <pre className={styles.recommendation}>{hedge.recommendation}</pre>
              <div className={styles.resultMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Short Size</span>
                  <span className={styles.metricValue}>{hedge.shortSize.toFixed(4)} BTC</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Required Margin</span>
                  <span className={styles.metricValue}>${hedge.requiredMargin.toFixed(0)} USDC</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Daily Carry</span>
                  <span className={`${styles.metricValue} ${hedge.dailyCarry >= 0 ? styles.positive : styles.negative}`}>
                    {hedge.dailyCarry >= 0 ? '+' : ''}${hedge.dailyCarry.toFixed(2)}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Total Cost ({duration}d)</span>
                  <span className={styles.metricValue}>${Math.abs(hedge.dailyCarry * duration).toFixed(2)}</span>
                </div>
              </div>
              <button type="button" className={styles.ctaButton}>Open this hedge on Pacifica</button>
            </div>
          ) : (
            <div className={styles.resultEmpty}>
              <p>Enter portfolio value to see hedge recommendation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
