'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.scss';

const NAV_ITEMS = [
  { href: '/', label: 'Liquidation Radar', icon: 'radar' },
  { href: '/whale-intelligence', label: 'Whale Intelligence', icon: 'whale' },
  { href: '/guard', label: 'SENTINEL Guard', icon: 'shield' },
  { href: '/africa-hedge', label: 'Africa FX Hedge', icon: 'hedge' },
  { href: '/funding-rates', label: 'Funding Rates', icon: 'chart' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <div className={styles.brand}>
        <span className={styles.logo}>S</span>
        <span className={styles.brandName}>SENTINEL</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{getIcon(item.icon)}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className={styles.tagline}>See the Cascade. Stop the Wipeout.</span>
      </div>
    </aside>
  );
}

function getIcon(icon: string): string {
  const icons: Record<string, string> = {
    radar: '\u25C9',
    whale: '\u29B6',
    shield: '\u25C6',
    hedge: '\u2616',
    chart: '\u2593',
  };
  return icons[icon] || '\u25CB';
}
