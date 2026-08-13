import React from 'react';

// Geometric mark — a single-line droplet with an inset lens ring, standing in
// for "read, verify, analyze." No mascot, no face: the brand carries through
// the wordmark and the teal/blue brand gradient, not an illustrated character.
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
        d="M50 14 C50 14 26 46 26 66 C26 83.12 36.66 96 50 96 C63.34 96 74 83.12 74 66 C74 46 50 14 50 14 Z"
        fill="url(#markGrad)"
      />
      <circle cx="63" cy="34" r="3.2" fill="#ffffff" opacity="0.5" />
      <circle cx="50" cy="68" r="11" fill="none" stroke="#ffffff" strokeWidth="3" />
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
      <desc>A geometric droplet with an inset lens ring</desc>
      <PoolLensMark variant={variant} />
    </svg>
  );
}

export const BRAND_ACCENT = TEAL;
