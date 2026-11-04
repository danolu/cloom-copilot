import type { ReactNode } from 'react';

export type BadgeTone = 'open' | 'settled' | 'other' | 'count' | 'accent';

const TONE_CLASS: Record<BadgeTone, string> = {
  open: 'status-pill status-open',
  settled: 'status-pill status-settled',
  other: 'status-pill status-other',
  count: 'count-pill',
  accent: 'badge',
};

// Shared mapping from a raw status string to a badge tone, so folios,
// tasks and any future list all colour the same statuses the same way.
export function statusTone(status: string): BadgeTone {
  const normalized = status.toLowerCase();
  if (normalized === 'open') return 'open';
  if (['settled', 'paid', 'closed'].includes(normalized)) return 'settled';
  return 'other';
}

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'other', className, children }: BadgeProps) {
  return <span className={`${TONE_CLASS[tone]}${className ? ` ${className}` : ''}`}>{children}</span>;
}
