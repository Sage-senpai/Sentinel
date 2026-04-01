'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { IconWallet, IconDisconnect, IconAgents } from '@/components/icons/Icons';
import styles from './Header.module.scss';

export function Header() {
  const { login, logout, authenticated, walletAddress, ready } = useAuth();
  const { connected } = useSocket();

  return (
    <header className="app-header">
      <div className={styles.left}>
        <h1 className={styles.title}>SENTINEL</h1>
        <span className={styles.badge}>LIVE</span>
      </div>

      <div className={styles.right}>
        <div className={styles.status}>
          <span className={`${styles.statusDot} ${connected ? '' : styles.statusDisconnected}`} />
          <IconAgents size={14} />
          <span className={styles.statusText}>
            {connected ? '6 Agents Active' : 'Connecting...'}
          </span>
        </div>

        {!ready ? (
          <div className={styles.statusText}>Loading...</div>
        ) : authenticated ? (
          <div className={styles.userSection}>
            <span className={styles.address}>
              {walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'Connected'}
            </span>
            <button className={styles.authButton} onClick={logout} type="button">
              <IconDisconnect size={14} />
              Disconnect
            </button>
          </div>
        ) : (
          <button className={styles.authButton} onClick={login} type="button">
            <IconWallet size={14} />
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
