'use client';

import styles from './DataSourceBadge.module.scss';

interface Props {
  source: 'live' | 'demo' | 'loading';
  label?: string;
}

export function DataSourceBadge({ source, label }: Props) {
  return (
    <span className={`${styles.badge} ${styles[source]}`}>
      <span className={styles.dot} />
      {label || (source === 'live' ? 'LIVE' : source === 'demo' ? 'DEMO' : '...')}
    </span>
  );
}
