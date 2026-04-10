'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { useNotify } from '@/components/providers/NotificationProvider';
import { playSound } from '@/services/sounds';
import { IconWallet, IconDisconnect, IconAgents } from '@/components/icons/Icons';
import { SettingsModal } from '@/components/layout/SettingsModal/SettingsModal';
import * as api from '@/services/api';
import styles from './Header.module.scss';

export function Header() {
  const { login, logout, authenticated, walletAddress, ready } = useAuth();
  const { push: notify } = useNotify();
  const prevAuthRef = useRef(authenticated);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: healthData } = useApi(() => api.health.check(), { pollInterval: 30000 });
  const apiConnected = !!healthData;

  useEffect(() => {
    if (prevAuthRef.current === authenticated) return;
    prevAuthRef.current = authenticated;
    if (authenticated) {
      notify('success', 'Wallet Connected', walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connected successfully');
      playSound('connect');
    } else {
      playSound('disconnect');
    }
  }, [authenticated, walletAddress, notify]);

  const handleLogin = useCallback(() => { login(); }, [login]);
  const handleLogout = useCallback(() => { logout(); }, [logout]);

  return (
    <>
      <header className="app-header">
        <div className={styles.left}>
          <h1 className={styles.title}>SENTINEL</h1>
          <span className={styles.badge}>LIVE</span>
        </div>

        <div className={styles.right}>
          <div className={styles.status}>
            <span className={`${styles.statusDot} ${apiConnected ? '' : styles.statusDisconnected}`} />
            <IconAgents size={14} />
            <span className={styles.statusText}>
              {apiConnected ? '6 Agents Active' : 'Connecting...'}
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
              <button className={styles.authButton} onClick={handleLogout} type="button">
                <IconDisconnect size={14} />
                Disconnect
              </button>
            </div>
          ) : (
            <button className={styles.authButton} onClick={handleLogin} type="button">
              <IconWallet size={14} />
              Connect Wallet
            </button>
          )}

          <button
            type="button"
            className={styles.settingsBtn}
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
