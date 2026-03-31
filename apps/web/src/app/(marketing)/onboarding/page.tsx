'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SentinelLogo, IconRadar, IconWhale, IconShield } from '@/components/icons/Icons';
import { useAuth } from '@/hooks/useAuth';
import styles from './Onboarding.module.scss';

const STEPS = [
  {
    icon: IconRadar,
    title: 'Real-Time Liquidation Radar',
    description:
      'See cascading liquidations forming across all Pacifica markets. Our AI predicts cascade events before they trigger mass liquidations.',
  },
  {
    icon: IconWhale,
    title: 'Whale Intelligence',
    description:
      'Track what smart money is doing. Get alerts when multiple whales converge on the same trade — before the crowd catches on.',
  },
  {
    icon: IconShield,
    title: 'Automated Protection',
    description:
      'SENTINEL Guard monitors your positions 24/7. When danger approaches, it acts — closing positions, adding margin, or bridging funds.',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { login, authenticated } = useAuth();

  const isLastStep = step === STEPS.length - 1;

  function handleNext() {
    if (isLastStep) {
      if (!authenticated) {
        login();
      }
      router.push('/dashboard');
    } else {
      setStep(step + 1);
    }
  }

  function handleSkip() {
    router.push('/dashboard');
  }

  const current = STEPS[step];

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <div className={styles.card}>
        <div className={styles.logoArea}>
          <SentinelLogo size={48} />
        </div>

        <div className={styles.content}>
          <div className={styles.iconCircle}>
            <current.icon size={36} />
          </div>
          <h2 className={styles.title}>{current.title}</h2>
          <p className={styles.description}>{current.description}</p>
        </div>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
              onClick={() => setStep(i)}
              type="button"
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.nextButton} onClick={handleNext} type="button">
            {isLastStep ? (authenticated ? 'Enter Dashboard' : 'Connect & Enter') : 'Next'}
          </button>
          <button className={styles.skipButton} onClick={handleSkip} type="button">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
