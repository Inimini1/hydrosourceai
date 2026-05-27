import React from 'react';
import { PoolLensIcon } from './PoolLensIcon';

export function LogoLockup({ size = 40 }) {
  const scale = size / 40;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(12 * scale) }}>
      <PoolLensIcon size={size} variant="dark" />
      <span style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 500,
        fontSize: Math.round(22 * scale),
        letterSpacing: '-0.02em',
        color: '#0A2D5A',
        lineHeight: 1,
      }}>
        PoolLens
      </span>
    </div>
  );
}

export function LogoLockupLight({ size = 40 }) {
  const scale = size / 40;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(12 * scale) }}>
      <PoolLensIcon size={size} variant="light" />
      <span style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 500,
        fontSize: Math.round(22 * scale),
        letterSpacing: '-0.02em',
        color: 'rgba(10,45,90,0.85)',
        lineHeight: 1,
      }}>
        PoolLens
      </span>
    </div>
  );
}
