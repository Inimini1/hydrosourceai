import React from 'react';

const NAVY = '#1c3f66';
const OUTLINE = '#2a5a94';
const ARM = '#7cc0ea';

// Mascot artwork authored in a 120x145 box (see app/icon.svg); scaled+centered
// here to fit the square viewBox this component's callers expect.
const SCALE = 100 / 145;
const OFFSET_X = (100 - 120 * SCALE) / 2;

export function PoolLensMark({ variant = 'dark' }) {
  const isLight = variant === 'light';

  return (
    <g>
      {isLight ? null : <circle cx="50" cy="50" r="50" fill="#ffffff" />}
      <g transform={`translate(${OFFSET_X}, 0) scale(${SCALE})`}>
        <defs>
          <linearGradient id="mascotBodyGrad" x1="15%" y1="0%" x2="90%" y2="60%">
            <stop offset="0%" stopColor="#bfe3fb" />
            <stop offset="55%" stopColor="#7cc0ea" />
            <stop offset="100%" stopColor="#4f9bd6" />
          </linearGradient>
        </defs>

        {/* Arms */}
        <path d="M25 88 Q10 92 11 104" fill="none" stroke={ARM} strokeWidth="7" strokeLinecap="round" />
        <path d="M95 88 Q110 92 109 104" fill="none" stroke={ARM} strokeWidth="7" strokeLinecap="round" />
        <circle cx="11" cy="105" r="5.5" fill={ARM} stroke={OUTLINE} strokeWidth="2" />
        <circle cx="109" cy="105" r="5.5" fill={ARM} stroke={OUTLINE} strokeWidth="2" />

        {/* Drop body */}
        <path
          d="M60 4 C58 4 22 52 22 80 C22 108 39 132 60 132 C81 132 98 108 98 80 C98 52 62 4 60 4Z"
          fill="url(#mascotBodyGrad)" stroke={OUTLINE} strokeWidth="3"
        />
        <circle cx="80" cy="40" r="3" fill="#ffffff" opacity="0.55" />

        {/* Coat: outer lapels + inner shirt collar + front seam */}
        <path
          d="M27 94 C23 111 38 133 60 133 C82 133 97 111 93 94 Z"
          fill="#ffffff" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round"
        />
        <line x1="27" y1="94" x2="52" y2="112" stroke={OUTLINE} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="93" y1="94" x2="68" y2="112" stroke={OUTLINE} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="40" y1="94" x2="60" y2="104" stroke={OUTLINE} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="80" y1="94" x2="60" y2="104" stroke={OUTLINE} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="60" y1="122" x2="60" y2="133" stroke={OUTLINE} strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <path d="M32 122 Q60 130 88 122" fill="none" stroke="#cfe6f7" strokeWidth="2" strokeLinecap="round" />

        {/* Tie */}
        <path
          d="M60 103 L66.5 113 L62 124 L60 130 L58 124 L53.5 113Z"
          fill="#3d7fc4" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round"
        />

        {/* Glasses */}
        <circle cx="45" cy="72" r="13.5" fill="none" stroke={NAVY} strokeWidth="3.4" />
        <circle cx="75" cy="72" r="13.5" fill="none" stroke={NAVY} strokeWidth="3.4" />
        <line x1="57.5" y1="70" x2="62.5" y2="70" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
        <line x1="31.7" y1="70" x2="24" y2="66" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
        <line x1="88.3" y1="70" x2="96" y2="66" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />

        {/* Eyes: white sclera + big iris + pupil + shine */}
        <circle cx="45" cy="73" r="8.5" fill="#ffffff" />
        <circle cx="75" cy="73" r="8.5" fill="#ffffff" />
        <circle cx="45.5" cy="73.5" r="6" fill="#3d8bd4" />
        <circle cx="75.5" cy="73.5" r="6" fill="#3d8bd4" />
        <circle cx="46" cy="74" r="3" fill="#12263f" />
        <circle cx="76" cy="74" r="3" fill="#12263f" />
        <circle cx="43.7" cy="71.3" r="1.8" fill="#ffffff" />
        <circle cx="73.7" cy="71.3" r="1.8" fill="#ffffff" />

        {/* Smile */}
        <path d="M53 87 Q60 92.5 67 87" fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" />
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
