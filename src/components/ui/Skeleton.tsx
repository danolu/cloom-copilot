import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

// Loading placeholder block.
export function Skeleton({ className, width, height, style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`skeleton${className ? ` ${className}` : ''}`}
      style={{ ...(width !== undefined ? { width } : null), ...(height !== undefined ? { height } : null), ...style }}
    />
  );
}
