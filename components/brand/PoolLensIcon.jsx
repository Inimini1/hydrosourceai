import React from 'react';

const TEAL = '#0FC490';
const NAVY = '#0A2D5A';
const HEX = [[50,12],[85,31],[85,69],[50,88],[15,69],[15,31]];

export function PoolLensMark({ variant = 'dark' }) {
  const isLight = variant === 'light';
  const trackColor  = isLight ? '#C5D9EC' : 'white';
  const dotColor    = isLight ? NAVY : TEAL;
  const dotOpacity  = isLight ? 0.55 : 0.70;
  const dropColor   = isLight ? NAVY : TEAL;
  const waveColor   = isLight ? NAVY : 'white';

  return (
    <g>
      {/* Layer 1 — Score arc */}
      <circle cx="50" cy="50" r="38" fill="none" stroke={trackColor} strokeWidth="5" opacity="0.09" />
      <path
        d="M 50,12 A 38,38 0 1,1 31,84"
        fill="none" stroke={TEAL} strokeWidth="5" strokeLinecap="round"
      />
      <circle cx="31" cy="84" r="3.8" fill={TEAL} />
      <circle cx="31" cy="84" r="1.8" fill="white" />

      {/* Layer 2 — Molecular bond dots */}
      {HEX.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.6" fill={dotColor} opacity={dotOpacity} />
      ))}

      {/* Layer 3 — Water drop */}
      <path
        d="M 50,27 C 61,27 69,38 69,49 C 69,61 61,69 50,69 C 39,69 31,61 31,49 C 31,38 39,27 50,27 Z"
        fill={dropColor}
      />
      <ellipse
        cx="43" cy="37" rx="4.5" ry="6"
        fill="white" opacity="0.26"
        transform="rotate(-22 43 37)"
      />

      {/* Layer 4 — Water waves */}
      <path
        d="M 27,79 Q 38,74 50,79 Q 62,84 73,79"
        fill="none" stroke={waveColor} strokeWidth="1.7" strokeLinecap="round" opacity="0.38"
      />
      <path
        d="M 33,87 Q 42,83 50,87 Q 58,91 67,87"
        fill="none" stroke={waveColor} strokeWidth="1.1" strokeLinecap="round" opacity="0.20"
      />
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
      aria-label="PoolLens logo"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>PoolLens</title>
      <desc>Pool chemistry AI app — teal water drop with health score arc and molecular bond dots</desc>
      {variant === 'dark' && <circle cx="50" cy="50" r="50" fill={NAVY} />}
      <PoolLensMark variant={variant} />
    </svg>
  );
}
