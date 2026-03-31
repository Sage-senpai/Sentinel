'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SentinelLogo,
  IconRadar,
  IconWhale,
  IconShield,
  IconHedge,
  IconChart,
} from '@/components/icons/Icons';
import styles from './Sidebar.module.scss';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Liquidation Radar', icon: 'radar' },
  { href: '/whale-intelligence', label: 'Whale Intelligence', icon: 'whale' },
  { href: '/guard', label: 'SENTINEL Guard', icon: 'shield' },
  { href: '/africa-hedge', label: 'Africa FX Hedge', icon: 'hedge' },
  { href: '/funding-rates', label: 'Funding Rates', icon: 'chart' },
] as const;

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  radar: IconRadar,
  whale: IconWhale,
  shield: IconShield,
  hedge: IconHedge,
  chart: IconChart,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <div className={styles.brand}>
        <SentinelLogo size={36} className={styles.logo} />
        <span className={styles.brandName}>SENTINEL</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>
                <Icon size={20} />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <span className={styles.tagline}>See the Cascade. Stop the Wipeout.</span>
      </div>
    </aside>
  );
}
