'use client';

import type { InputHTMLAttributes, Ref } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

// Text input with the shared `.text-field` style.
export function TextField({ className, ref, ...props }: TextFieldProps) {
  return <input ref={ref} className={`text-field${className ? ` ${className}` : ''}`} {...props} />;
}
