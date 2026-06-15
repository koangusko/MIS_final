import type { CSSProperties } from 'react';
import { ICON_PATHS, type IconName } from '../lib/icons';

export function Icon({
  name,
  size = 20,
  sw = 1.6,
  style,
}: {
  name: IconName;
  size?: number;
  sw?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
