import type { CSSProperties, ReactNode } from 'react';
import { Typography } from '../ui/Typography';
import { STAT_TONES, type StatTone } from './tokens';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  /** Bottom context line, e.g. "Rooms 103 · 204" or "Next 14:00 · Amara Osei". */
  detail?: ReactNode;
  /** 0-100. Renders a progress track under the value when set. */
  progress?: number;
  featured?: boolean;
  icon: ReactNode;
  tone: StatTone;
}

export function StatCard({ label, value, hint, detail, progress, featured, icon, tone }: StatCardProps) {
  const colors = STAT_TONES[tone];
  const style = {
    '--stat-accent': colors.color,
    '--stat-soft': colors.background,
  } as CSSProperties;
  return (
    <article className={`stat-card${featured ? ' stat-card-featured' : ''}`} style={style}>
      <div className="stat-card-top">
        <Typography variant="overline" tone="muted" as="div">
          {label}
        </Typography>
        <div className="stat-icon" aria-hidden>
          {icon}
        </div>
      </div>
      <Typography variant="stat" as="div" className="stat-value">
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" tone="tertiary" as="div">
          {hint}
        </Typography>
      )}
      {progress !== undefined && (
        <div
          className="stat-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label={label}
        >
          <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}
      {detail && <div className="stat-detail">{detail}</div>}
    </article>
  );
}
