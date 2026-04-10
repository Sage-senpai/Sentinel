'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isMasterMuted, setMasterMute, getSoundPrefs, updateSoundPrefs } from '@/services/sounds';
import styles from './SettingsModal.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SOUND_TYPES = [
  { key: 'cascade', label: 'Cascade Alerts', desc: 'Urgent alarm on cascade imminent' },
  { key: 'whale', label: 'Whale Events', desc: 'Sonar ping on large whale activity' },
  { key: 'guard', label: 'Guard Actions', desc: 'Shield tone on position protection' },
  { key: 'alert', label: 'General Alerts', desc: 'Double beep notifications' },
  { key: 'success', label: 'Success', desc: 'Ascending tone on completed actions' },
  { key: 'connect', label: 'Wallet Connect', desc: 'Chord on wallet connection' },
] as const;

export function SettingsModal({ open, onClose }: Props) {
  const { authenticated, walletAddress, email } = useAuth();
  const [muted, setMuted] = useState(false);
  const [soundPrefs, setSoundPrefs] = useState<Record<string, { enabled: boolean; volume: number }>>({});
  const [activeTab, setActiveTab] = useState<'general' | 'sounds' | 'account'>('general');

  useEffect(() => {
    if (open) {
      setMuted(isMasterMuted());
      setSoundPrefs(getSoundPrefs() as Record<string, { enabled: boolean; volume: number }>);
    }
  }, [open]);

  if (!open) return null;

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMasterMute(next);
  };

  const toggleSound = (key: string) => {
    const current = soundPrefs[key];
    if (!current) return;
    const updated = { ...current, enabled: !current.enabled };
    setSoundPrefs((prev) => ({ ...prev, [key]: updated }));
    updateSoundPrefs(key as Parameters<typeof updateSoundPrefs>[0], updated);
  };

  const setVolume = (key: string, vol: number) => {
    const current = soundPrefs[key];
    if (!current) return;
    const updated = { ...current, volume: vol };
    setSoundPrefs((prev) => ({ ...prev, [key]: updated }));
    updateSoundPrefs(key as Parameters<typeof updateSoundPrefs>[0], updated);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Settings</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <span>&times;</span>
          </button>
        </div>

        <div className={styles.tabs}>
          {(['general', 'sounds', 'account'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {activeTab === 'general' && (
            <div className={styles.section}>
              <div className={styles.row}>
                <div>
                  <span className={styles.rowLabel}>Dark Mode</span>
                  <span className={styles.rowDesc}>Always on — SENTINEL uses a dark theme</span>
                </div>
                <span className={styles.badge}>ON</span>
              </div>
              <div className={styles.row}>
                <div>
                  <span className={styles.rowLabel}>Data Refresh Rate</span>
                  <span className={styles.rowDesc}>API polling interval for live data</span>
                </div>
                <span className={styles.badge}>10-30s</span>
              </div>
              <div className={styles.row}>
                <div>
                  <span className={styles.rowLabel}>Reduced Motion</span>
                  <span className={styles.rowDesc}>Follows your system preference</span>
                </div>
                <span className={styles.badge}>System</span>
              </div>
            </div>
          )}

          {activeTab === 'sounds' && (
            <div className={styles.section}>
              <div className={styles.row} onClick={toggleMute}>
                <div>
                  <span className={styles.rowLabel}>Master Mute</span>
                  <span className={styles.rowDesc}>Disable all notification sounds</span>
                </div>
                <button type="button" className={`${styles.toggle} ${muted ? styles.toggleOff : styles.toggleOn}`}>
                  {muted ? 'OFF' : 'ON'}
                </button>
              </div>
              {!muted && SOUND_TYPES.map((s) => {
                const pref = soundPrefs[s.key];
                if (!pref) return null;
                return (
                  <div key={s.key} className={styles.row}>
                    <div>
                      <span className={styles.rowLabel}>{s.label}</span>
                      <span className={styles.rowDesc}>{s.desc}</span>
                    </div>
                    <div className={styles.soundControls}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(pref.volume * 100)}
                        onChange={(e) => setVolume(s.key, Number(e.target.value) / 100)}
                        className={styles.volumeSlider}
                        disabled={!pref.enabled}
                      />
                      <button
                        type="button"
                        className={`${styles.toggle} ${pref.enabled ? styles.toggleOn : styles.toggleOff}`}
                        onClick={() => toggleSound(s.key)}
                      >
                        {pref.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'account' && (
            <div className={styles.section}>
              <div className={styles.row}>
                <div>
                  <span className={styles.rowLabel}>Status</span>
                  <span className={styles.rowDesc}>{authenticated ? 'Connected' : 'Not connected'}</span>
                </div>
                <span className={`${styles.badge} ${authenticated ? styles.badgeLive : ''}`}>
                  {authenticated ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              {walletAddress && (
                <div className={styles.row}>
                  <div>
                    <span className={styles.rowLabel}>Wallet</span>
                    <span className={styles.rowDesc}>{walletAddress}</span>
                  </div>
                </div>
              )}
              {email && (
                <div className={styles.row}>
                  <div>
                    <span className={styles.rowLabel}>Email</span>
                    <span className={styles.rowDesc}>{email}</span>
                  </div>
                </div>
              )}
              <div className={styles.row}>
                <div>
                  <span className={styles.rowLabel}>Tier</span>
                  <span className={styles.rowDesc}>Current subscription plan</span>
                </div>
                <span className={styles.badge}>FREE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
