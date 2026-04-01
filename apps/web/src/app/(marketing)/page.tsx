'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  SentinelLogo,
  IconRadar,
  IconWhale,
  IconShield,
  IconHedge,
  IconChart,
  IconAgents,
} from '@/components/icons/Icons';
import styles from './Landing.module.scss';

// ── Scroll reveal hook ──────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

// ── Live ticker counter ─────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !counted) { setCounted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [counted]);

  useEffect(() => {
    if (!counted) return;
    const num = parseInt(target.replace(/\D/g, ''));
    if (isNaN(num) || num === 0) { setDisplay(target); return; }

    let current = 0;
    const step = Math.max(1, Math.floor(num / 30));
    const id = setInterval(() => {
      current = Math.min(current + step, num);
      setDisplay(target.replace(/\d+/, String(current)));
      if (current >= num) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [counted, target]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ── Data ────────────────────────────────────────────────────
const FEATURES = [
  { icon: IconRadar, title: 'Liquidation Radar', description: 'D3-powered heatmap visualizing liquidation clusters across all markets. See cascades forming before they trigger.' },
  { icon: IconWhale, title: 'Whale Intelligence', description: 'Track whale wallets, decode intent (accumulating, distributing, hedging), and get convergence alerts when smart money aligns.' },
  { icon: IconShield, title: 'SENTINEL Guard', description: 'Automated position protection. Set thresholds, and Guard acts before you get liquidated — partial close, full close, or add margin.' },
  { icon: IconHedge, title: 'Africa FX Hedge', description: 'Hedge NGN, KES, GHS exposure through BTC perpetuals on Pacifica. Purpose-built for African traders and businesses.' },
  { icon: IconChart, title: 'Funding Rate Intel', description: 'ARIMA + LSTM ensemble forecasts 4 epochs ahead. Spot carry opportunities and avoid funding rate surprises.' },
  { icon: IconAgents, title: '6 AI Agents', description: 'Background agents running 24/7 — monitoring positions, predicting cascades, tracking whales, and protecting your capital.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect Your Wallet', description: 'Sign in with your wallet, email, or Google via Privy. SENTINEL creates an embedded wallet if you don\'t have one.' },
  { step: '02', title: 'Agents Start Monitoring', description: '6 AI agents spin up instantly — scanning liquidation clusters, tracking whales, and monitoring your positions every 10 seconds.' },
  { step: '03', title: 'Get Alerts, Stay Protected', description: 'Receive real-time alerts on cascade events. Guard bot auto-executes protective orders before liquidation hits.' },
];

const STATS = [
  { value: '<500ms', label: 'Alert Latency' },
  { value: '10s', label: 'Guard Scan' },
  { value: '6', label: 'AI Agents' },
  { value: '85%+', label: 'Detection' },
  { value: '3', label: 'Currencies' },
  { value: '24/7', label: 'Monitoring' },
];

const SPONSORS = ['Pacifica', 'Privy', 'Elfa AI', 'Fuul', 'Rhino.fi', 'Arbitrum', 'CoinGecko'];

const FAQ = [
  { q: 'What is a liquidation cascade?', a: 'When a large position gets liquidated, it can push the price further, triggering more liquidations in a chain reaction. SENTINEL\'s AI detects these cascades 5-60 minutes before they trigger.' },
  { q: 'How does Guard protect my positions?', a: 'Guard monitors your Pacifica positions every 10 seconds. When your margin ratio drops below your threshold, it automatically executes protective actions.' },
  { q: 'Do I need a wallet?', a: 'No. SENTINEL uses Privy which supports email, Google, and wallet login. If you don\'t have a wallet, Privy creates an embedded one for you.' },
  { q: 'Is it free?', a: 'The free tier gives you the liquidation radar (30s delay) and 3 whale alerts per day. Pro ($29/mo) unlocks real-time data, Guard bot, and all modules.' },
  { q: 'Are alerts stored on-chain?', a: 'Yes. High-confidence alerts (>85%) are published to our SentinelAlertRegistry smart contract on Arbitrum for verifiability.' },
  { q: 'What data does Whale Intelligence use?', a: 'We combine Elfa AI social signals with Pacifica order flow data to track wallets making trades over $100K with intent classification.' },
];

const TIERS = [
  { name: 'Free', price: '$0', period: 'forever', features: ['Liquidation radar (30s delay)', '3 whale alerts/day', 'Basic cascade predictions', 'Community support'], cta: 'Get Started', highlighted: false },
  { name: 'Pro', price: '$29', period: '/month', features: ['Real-time data (<500ms)', 'Unlimited whale alerts', 'SENTINEL Guard bot', 'Funding rate forecasts', 'Africa FX hedge calculator', 'Priority support'], cta: 'Start Pro', highlighted: true },
  { name: 'Institutional', price: '$499', period: '/month', features: ['Everything in Pro', 'REST API access', 'Custom webhooks', 'White-glove onboarding', 'Custom alert thresholds', 'SLA guarantee'], cta: 'Contact Sales', highlighted: false },
];

// ── Feature Carousel ────────────────────────────────────────
function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const reveal = useReveal();

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((p) => (p + 1) % FEATURES.length), 4000);
  }, []);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [resetTimer]);

  const goTo = (i: number) => { setActive(i); resetTimer(); };

  const f = FEATURES[active];

  return (
    <section
      className={`${styles.features} ${reveal.visible ? styles.revealed : ''}`}
      id="features"
      ref={reveal.ref as React.RefObject<HTMLElement>}
    >
      <h2 className={styles.sectionTitle}>Everything You Need</h2>
      <p className={styles.sectionSubtitle}>Six specialized modules backed by six AI agents.</p>

      <div className={styles.carouselTabs}>
        {FEATURES.map((feat, i) => (
          <button
            key={feat.title}
            type="button"
            className={`${styles.carouselTab} ${i === active ? styles.carouselTabActive : ''}`}
            onClick={() => goTo(i)}
          >
            <feat.icon size={18} />
            <span>{feat.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.carouselStage}>
        <div className={styles.carouselCard} key={active}>
          <div className={styles.featureIcon}><f.icon size={32} /></div>
          <h3>{f.title}</h3>
          <p>{f.description}</p>
        </div>
        <div className={styles.carouselProgress}>
          {FEATURES.map((_, i) => (
            <div key={i} className={styles.progressDot}>
              <div
                className={`${styles.progressFill} ${i === active ? styles.progressActive : ''}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Also keep the full grid for desktop */}
      <div className={styles.featureGrid}>
        {FEATURES.map((feat, i) => (
          <div
            key={feat.title}
            className={styles.featureCard}
            onMouseEnter={() => goTo(i)}
          >
            <div className={styles.featureIconSmall}><feat.icon size={22} /></div>
            <h3>{feat.title}</h3>
            <p>{feat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function LandingPage() {
  const stepsReveal = useReveal();
  const pricingReveal = useReveal();
  const faqReveal = useReveal();

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <SentinelLogo size={28} />
            <span className={styles.navBrandName}>SENTINEL</span>
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <Link href="/docs">Docs</Link>
            <Link href="/onboarding" className={styles.navCta}>Launch App</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Built for the Pacifica Hackathon 2026
          </div>
          <h1 className={styles.heroTitle}>
            See the Cascade.<br />
            <span className={styles.heroAccent}>Stop the Wipeout.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            6 AI agents monitor liquidation cascades, track whale movements, and protect your positions — all in real time on Pacifica.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/onboarding" className={styles.ctaPrimary}>Get Started Free</Link>
            <a href="#features" className={styles.ctaSecondary}>Explore Features</a>
          </div>
        </div>
      </section>

      {/* Stats Ticker — continuous scroll */}
      <section className={styles.statsTicker}>
        <div className={styles.tickerTrack}>
          {[...STATS, ...STATS].map((s, i) => (
            <div key={`${s.label}-${i}`} className={styles.tickerStat}>
              <span className={styles.tickerValue}><AnimatedCounter target={s.value} /></span>
              <span className={styles.tickerLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Carousel */}
      <FeatureCarousel />

      {/* How It Works */}
      <section
        className={`${styles.howItWorks} ${stepsReveal.visible ? styles.revealed : ''}`}
        id="how-it-works"
        ref={stepsReveal.ref as React.RefObject<HTMLElement>}
      >
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionSubtitle}>Three steps to automated protection.</p>
        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className={styles.stepCard} style={{ animationDelay: `${i * 0.15}s` }}>
              <span className={styles.stepNumber}>{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {i < HOW_IT_WORKS.length - 1 && <div className={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* Sponsors — infinite marquee */}
      <section className={styles.sponsors}>
        <p className={styles.sponsorsLabel}>Powered by</p>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {[...SPONSORS, ...SPONSORS, ...SPONSORS].map((s, i) => (
              <span key={`${s}-${i}`} className={styles.marqueeItem}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        className={`${styles.pricing} ${pricingReveal.visible ? styles.revealed : ''}`}
        id="pricing"
        ref={pricingReveal.ref as React.RefObject<HTMLElement>}
      >
        <h2 className={styles.sectionTitle}>Simple Pricing</h2>
        <p className={styles.sectionSubtitle}>Start free. Upgrade when you need real-time data and automated protection.</p>
        <div className={styles.pricingGrid}>
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className={`${styles.pricingCard} ${tier.highlighted ? styles.pricingHighlighted : ''}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {tier.highlighted && <div className={styles.pricingPopular}>Most Popular</div>}
              <h3>{tier.name}</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.priceAmount}>{tier.price}</span>
                <span className={styles.pricePeriod}>{tier.period}</span>
              </div>
              <ul className={styles.pricingFeatures}>
                {tier.features.map((f) => (<li key={f}>{f}</li>))}
              </ul>
              <Link href="/onboarding" className={tier.highlighted ? styles.ctaPrimary : styles.ctaOutline}>{tier.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        className={`${styles.faq} ${faqReveal.visible ? styles.revealed : ''}`}
        id="faq"
        ref={faqReveal.ref as React.RefObject<HTMLElement>}
      >
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {FAQ.map((item, i) => (
            <div key={item.q} className={styles.faqCard} style={{ animationDelay: `${i * 0.08}s` }}>
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}><SentinelLogo size={20} /><span>SENTINEL</span></div>
          <div className={styles.footerLinks}>
            <Link href="/docs">Docs</Link>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <span className={styles.footerText}>Pacifica Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
