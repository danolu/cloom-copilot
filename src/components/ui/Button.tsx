'use client';

import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-soft' | 'chip';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

// Shared button. Forwards every prop (including the ref Radix injects via
// asChild/Slot) to the underlying <button>, so it composes with
// Popover.Trigger, Popover.Close and Tooltip.Trigger.
export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`btn btn-${variant} btn-${size}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}

export type IconButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Required: icon-only buttons must be labelled for screen readers and tooltips. */
  'aria-label': string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export function IconButton({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`icon-btn icon-btn-${variant} icon-btn-${size}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
}
