import React from 'react';

const NAVY = '#1c3f66';

// Mascot artwork authored in a 120x140 box (see app/icon.svg); scaled+centered
// here to fit the square viewBox this component's callers expect.
const SCALE = 100 / 140;
const OFFSET_X = (100 - 120 * SCALE) / 2;

export function PoolLensMark({ variant = 'dark' }) {
  const isLight = variant === 'light';

  return (
    <g>
      {isLight ? null : <circle cx="50" cy="50" r="50" fill="#ffffff" />}
      <g transform={`translate(${OFFSET_X}, 0) scale(${SCALE})`}>
        <defs>
          <linearGradient id="mascotBodyGrad" x1="20%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#bfe3fb" />
            <stop offset="100%" stopColor="#5aa8dd" />
          </linearGradient>
        </defs>

        {/* Drop body */}
        <path
          d="M60 4 C58 4 22 52 22 80 C22 108 39 132 60 132 C81 132 98 108 98 80 C98 52 62 4 60 4Z"
          fill="url(#mascotBodyGrad)" stroke={NAVY} strokeWidth="3"
        />

        {/* Coat, spread across the full lower body */}
        <path
          d="M27 94 C23 111 38 133 60 133 C82 133 97 111 93 94 Z"
          fill="#ffffff" stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round"
        />
        <line x1="27" y1="94" x2="49" y2="107" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="93" y1="94" x2="71" y2="107" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" />

        {/* Tie */}
        <path
          d="M60 101 L66 112 L61.5 126 L60 131 L58.5 126 L54 112Z"
          fill="#4a90d9" stroke={NAVY} strokeWidth="2" strokeLinejoin="round"
        />

        {/* Glasses */}
        <circle cx="45" cy="72" r="13" fill="none" stroke={NAVY} strokeWidth="3.2" />
        <circle cx="75" cy="72" r="13" fill="none" stroke={NAVY} strokeWidth="3.2" />
        <line x1="58" y1="72" x2="62" y2="72" stroke={NAVY} strokeWidth="3" />

        {/* Eyes */}
        <circle cx="45" cy="72" r="7" fill="#ffffff" />
        <circle cx="75" cy="72" r="7" fill="#ffffff" />
        <circle cx="47" cy="73" r="4" fill={NAVY} />
        <circle cx="77" cy="73" r="4" fill={NAVY} />
        <circle cx="45.3" cy="71" r="1.4" fill="#ffffff" />
        <circle cx="75.3" cy="71" r="1.4" fill="#ffffff" />
        <ellipse cx="35" cy="83" rx="4" ry="2.5" fill="#ff9d9d" opacity="0.55" />
        <ellipse cx="85" cy="83" rx="4" ry="2.5" fill="#ff9d9d" opacity="0.55" />

        {/* Smile */}
        <path d="M50 87 Q60 97 70 87" fill="none" stroke={NAVY} strokeWidth="2.8" strokeLinecap="round" />
      </g>
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
      <desc>Pool chemistry AI app mascot — a friendly water drop in glasses and a tie</desc>
      <PoolLensMark variant={variant} />
    </svg>
  );
}
