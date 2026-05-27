import React from 'react';
import { PoolLensMark } from './PoolLensIcon';

export function AppIcon({ size = 1024 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx={22.4} ry={22.4} fill="#0A2D5A" />
      {/* viewBox "10 10 80 80" insets the mark 10% on all sides — required App Store padding */}
      <svg x="0" y="0" width="100" height="100" viewBox="10 10 80 80">
        <PoolLensMark variant="dark" />
      </svg>
    </svg>
  );
}
