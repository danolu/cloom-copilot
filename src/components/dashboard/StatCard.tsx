import type { ReactNode } from 'react';
import { Typography } from '../ui/Typography';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
}

export function StatCard({ label, value, hint, icon, iconBackground, iconColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBackground, color: iconColor }} aria-hidden>
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
