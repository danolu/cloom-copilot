import { createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export type TypographyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'caption' | 'overline' | 'stat';

type Tone = 'default' | 'muted' | 'tertiary' | 'accent' | 'danger' | 'inherit';

const DEFAULT_TAG: Record<TypographyVariant, string> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  overline: 'span',
  stat: 'div',
};

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  /** Override the rendered element (defaults from the variant). Keep it semantic. */
  as?: string;
  tone?: Tone;
  children: ReactNode;
  style?: CSSProperties;
}

// Single source of truth for text styles. Use this instead of ad-hoc
// fontSize/fontWeight inline styles or one-off heading classes.
export function Typography({ variant = 'body', as, tone = 'default', className, children, ...props }: TypographyProps) {
  return createElement(
    as ?? DEFAULT_TAG[variant],
    { ...props, className: `type type-${variant} type-tone-${tone}${className ? ` ${className}` : ''}` },
    children,
  );
}
