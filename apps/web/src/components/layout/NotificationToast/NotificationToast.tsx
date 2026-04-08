'use client';

import { type Notification, type NotificationType } from '@/hooks/useNotifications';
import styles from './NotificationToast.module.scss';

interface Props {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: string; label: string }> = {
  cascade: { icon: '!!', label: 'CASCADE' },
  whale:   { icon: '\uD83D\uDC33', label: 'WHALE' },
  guard:   { icon: '\uD83D\uDEE1', label: 'GUARD' },
  alert:   { icon: '\u26A0', label: 'ALERT' },
  success: { icon: '\u2713', label: 'SUCCESS' },
  info:    { icon: 'i', label: 'INFO' },
};

export function NotificationToast({ notifications, onDismiss }: Props) {
  if (notifications.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {notifications.slice(0, 5).map((n) => {
        const cfg = TYPE_CONFIG[n.type];
        return (
          <div
            key={n.id}
            className={`${styles.toast} ${styles[`toast_${n.type}`]}`}
          >
            <div className={styles.iconCol}>
              <span className={styles.icon}>{cfg.icon}</span>
            </div>
            <div className={styles.body}>
              <div className={styles.header}>
                <span className={styles.label}>{cfg.label}</span>
                <span className={styles.time}>
                  {new Date(n.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className={styles.title}>{n.title}</p>
              <p className={styles.message}>{n.message}</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => onDismiss(n.id)}
              aria-label="Dismiss"
            >
              x
            </button>
          </div>
        );
      })}
    </div>
  );
}
