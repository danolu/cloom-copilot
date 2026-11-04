import type { ReactNode } from 'react';
import { Typography } from '../ui/Typography';
import { STAT_TONES, type StatTone } from './tokens';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  tone: StatTone;
}

export function StatCard({ label, value, hint, icon, tone }: StatCardProps) {
  const colors = STAT_TONES[tone];
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: colors.background, color: colors.color }} aria-hidden>
        {icon}
      </div>
      <div>
        <Typography variant="overline" tone="muted" as="div">
          {label}
        </Typography>
        <Typography variant="stat" as="div">
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" tone="tertiary" as="div">
            {hint}
          </Typography>
        )}
      </div>
    </div>
  );
}
