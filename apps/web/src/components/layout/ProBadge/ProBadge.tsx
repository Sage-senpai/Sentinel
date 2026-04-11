'use client';

import { useState } from 'react';
import styles from './ProBadge.module.scss';

interface Props {
  feature: string;
  description: string;
  inline?: boolean;
}

export function ProBadge({ feature, description, inline }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className={`${styles.badge} ${inline ? styles.inline : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      PRO
      {showTooltip && (
        <div className={styles.tooltip}>
          <strong>{feature}</strong>
          <p>{description}</p>
          <span className={styles.upgrade}>Upgrade to Pro ($29/mo) to unlock</span>
        </div>
      )}
    </span>
  );
}
