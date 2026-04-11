'use client';

import { useState, useEffect } from 'react';
import styles from './OnboardingTooltips.module.scss';

const TIPS = [
  { id: 'radar', target: 'Liquidation Radar', text: 'This heatmap shows liquidation density across markets. Red zones = high cascade risk. Click a market on the left to switch.' },
  { id: 'whale', target: 'Whale Intelligence', text: 'Live whale activity from Elfa AI. Watch for ACCUMULATING signals — when 3+ whales align, you get a convergence alert.' },
  { id: 'guard', target: 'SENTINEL Guard', text: 'Toggle Guard ON to protect positions. It monitors every 10s and auto-executes protective orders when your margin drops.' },
  { id: 'hedge', target: 'FX Hedge', text: 'Select your local currency, enter portfolio value, and get a BTC perpetual hedge recommendation with live rates.' },
  { id: 'funding', target: 'Funding Rates', text: 'Live funding rates from Pacifica. Click any market row to see the 4-epoch ARIMA+LSTM forecast.' },
];

const STORAGE_KEY = 'sentinel-onboarding-done';

export function OnboardingTooltips() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const tip = TIPS[step];
  const isLast = step === TIPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.step}>{step + 1}/{TIPS.length}</span>
          <button type="button" className={styles.skipBtn} onClick={handleSkip}>Skip tour</button>
        </div>
        <h3 className={styles.target}>{tip.target}</h3>
        <p className={styles.text}>{tip.text}</p>
        <div className={styles.footer}>
          <div className={styles.dots}>
            {TIPS.map((_, i) => (
              <span key={i} className={`${styles.dot} ${i === step ? styles.dotActive : ''}`} />
            ))}
          </div>
          <button type="button" className={styles.nextBtn} onClick={handleNext}>
            {isLast ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
