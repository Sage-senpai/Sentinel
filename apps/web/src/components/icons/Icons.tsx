interface IconProps {
  size?: number;
  className?: string;
}

export function SentinelLogo({ size = 40, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="sl-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#00b8d9" />
        </linearGradient>
        <linearGradient id="sl-i" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00b8d9" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M24 2L6 10v14c0 11.1 7.7 21.4 18 24 10.3-2.6 18-12.9 18-24V10L24 2z" stroke="url(#sl-g)" strokeWidth="2" fill="url(#sl-i)" />
      <circle cx="24" cy="22" r="8" stroke="url(#sl-g)" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="22" r="3" fill="url(#sl-g)" />
      <path d="M24 14v-2M24 32v-2M16 22h-2M34 22h-2" stroke="url(#sl-g)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 36c1.8 1.6 3.8 2.8 6 3.5 2.2-.7 4.2-1.9 6-3.5" stroke="url(#sl-g)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function IconRadar({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
      <path d="M12 12L18.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconWhale({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <path d="M3 13c0-4.5 3.5-8 8-8h2c3 0 5.5 1.5 7 4l1 2c.3.7 0 1.5-.7 1.8-.2.1-.4.2-.6.2H19c-1 3-3.5 5-7 5s-6-1.5-7.5-4L3 13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <path d="M2 9c1-2 2.5-3.5 4.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1.5 12c.5-1.5 1.2-2.8 2.2-3.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 18c-.5 1.5-1 2.5-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconShield({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <path d="M12 2L4 6v5c0 6.6 3.4 12.7 8 14.5 4.6-1.8 8-7.9 8-14.5V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHedge({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6v12M8 9l4-3 4 3M8 15l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChart({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 16l4-5 3 3 4-6 5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="16" r="1.2" fill="currentColor" />
      <circle cx="8" cy="11" r="1.2" fill="currentColor" />
      <circle cx="11" cy="14" r="1.2" fill="currentColor" />
      <circle cx="15" cy="8" r="1.2" fill="currentColor" />
      <circle cx="20" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconWallet({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="15" r="1.5" fill="currentColor" />
      <path d="M6 6V5a3 3 0 013-3h6a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconDisconnect({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconAgents({ size = 20, className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" className={className}>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="19" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 11v2M8 13l-1.5 1M16 13l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2.5 19c.8-1.5 2-2.5 3.5-2.5M21.5 19c-.8-1.5-2-2.5-3.5-2.5M8 21c1-2 2.5-3 4-3s3 1 4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
