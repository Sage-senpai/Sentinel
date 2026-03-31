'use client';

import { useAuth } from '@/hooks/useAuth';
import styles from './Header.module.scss';

export function Header() {
  const { login, logout, authenticated, walletAddress } = useAuth();

  return (
    <header className="app-header">
      <div className={styles.left}>
        <h1 className={styles.title}>SENTINEL</h1>
        <span className={styles.badge}>LIVE</span>
      </div>

      <div className={styles.right}>
        <div className={styles.status}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>6 Agents Active</span>
        </div>

        {authenticated ? (
          <div className={styles.userSection}>
            <span className={styles.address}>
              {walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'Connected'}
            </span>
            <button
              className={styles.authButton}
              onClick={logout}
              type="button"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            className={styles.authButton}
            onClick={login}
            type="button"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
