import React from 'react';

// Geometric mark — a faceted "crystal" droplet with a scanning double-ring,
// standing in for "read, verify, analyze." Faceted crown (straight edges)
// reads more tech/futuristic than a fully organic teardrop; the open double
// ring reads as an active scan/radar sweep rather than a static lens.
// No mascot, no face — the brand carries through the wordmark and the
// teal/blue brand gradient, not an illustrated character.
const TEAL = '#00C9B1';
const CYAN = '#00f2ff';

export function PoolLensMark({ variant = 'dark' }) {
  const isLight = variant === 'light';

  return (
    <g>
      {isLight ? null : <circle cx="50" cy="50" r="50" fill="#ffffff" />}
      <defs>
        <linearGradient id="markGrad" x1="15%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="100%" stopColor={TEAL} />
        </linearGradient>
      </defs>
      <path
        d="M50 8 L76 32 L80 58 C80 80 66 94 50 94 C34 94 20 80 20 58 L24 32 Z"
        fill="url(#markGrad)"
      />
      <path d="M50 8 L80 58" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1.3" fill="none" />
      <path d="M50 8 L20 58" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.3" fill="none" />
      <circle cx="66" cy="32" r="3" fill="#ffffff" opacity="0.55" />
      <circle cx="50" cy="64" r="16.5" fill="none" stroke="#ffffff" strokeOpacity="0.32" strokeWidth="1.4" />
      <circle cx="50" cy="64" r="11" fill="none" stroke="#ffffff" strokeWidth="3" />
    </g>
  );
}

export function PoolLensIcon({ size = 48, variant = 'dark', className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="HydroSource AI logo"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>HydroSource AI</title>
      <desc>A faceted droplet with a scanning double ring</desc>
      <PoolLensMark variant={variant} />
    </svg>
  );
}

export const BRAND_ACCENT = TEAL;
