import type { ReactNode } from 'react';
import { Typography } from './Typography';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  'aria-label': string;
  className?: string;
  children: ReactNode;
}

// Dashboard section with an optional header row.
export function Card({ title, icon, actions, className, children, ...props }: CardProps) {
  return (
    <section className={`section-card${className ? ` ${className}` : ''}`} {...props}>
      {title !== undefined && (
        <div className="section-head">
          <Typography variant="h2" className="section-title">
            {icon}
            {title}
          </Typography>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
