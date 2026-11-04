import type { ReactNode } from 'react';
import { Typography } from './Typography';

export type EmptyStateVariant = 'panel' | 'page';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

// Empty message. `panel` is a short note in a list; `page` adds an icon and button.
export function EmptyState({ variant = 'panel', icon, action, children }: EmptyStateProps) {
  if (variant === 'panel') {
    return <div className="panel-empty">{children}</div>;
  }
  return (
    <div className="dashboard-empty">
      {icon}
      <Typography variant="body-sm" tone="muted">
        {children}
      </Typography>
      {action}
    </div>
  );
}
