import React from 'react';

export const HydroSourceLogo = ({ size = 48, variant = 'dark', className = '', ...props }) => {
  const isDark = variant === 'dark';
  
  const circleFill = isDark ? '#0A2D5A' : 'transparent';
  const circleStroke = isDark ? 'none' : '#0A2D5A';
  const circleStrokeWidth = isDark ? 0 : 1;
  const elementsColor = isDark ? '#FFFFFF' : '#0A2D5A';
  const dropColor = '#0FC490';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      role="img"
      aria-label="HydroSource logo"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>HydroSource</title>
      <desc>Water drop analysis icon representing AI pool chemistry scanning</desc>
      
      <circle cx="40" cy="40" r="39.5" fill={circleFill} stroke={circleStroke} strokeWidth={circleStrokeWidth} />
      
      <line x1="40" y1="0.5" x2="40" y2="6" stroke={elementsColor} strokeWidth="1.8" opacity="0.55" />
      <line x1="40" y1="74" x2="40" y2="79.5" stroke={elementsColor} strokeWidth="1.8" opacity="0.55" />
      <line x1="74" y1="40" x2="79.5" y2="40" stroke={elementsColor} strokeWidth="1.8" opacity="0.55" />
      <line x1="0.5" y1="40" x2="6" y2="40" stroke={elementsColor} strokeWidth="1.8" opacity="0.55" />
      
      <circle cx="40" cy="40" r="29" fill="none" stroke={elementsColor} strokeWidth="1" opacity="0.18" />
      <circle cx="40" cy="40" r="17" fill="none" stroke={elementsColor} strokeWidth="1" opacity="0.12" />
      
      <path d="M 40,18 C 51,18 58,28 58,40 C 58,52 50,62 40,62 C 30,62 22,52 22,40 C 22,28 29,18 40,18 Z" fill={dropColor} />
      
      <ellipse cx="33" cy="29" rx="4" ry="5.5" fill="#FFFFFF" opacity="0.28" transform="rotate(-22 33 29)" />
    </svg>
  );
};
