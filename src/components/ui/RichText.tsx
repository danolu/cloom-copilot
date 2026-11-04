import { Fragment } from 'react';

// Bot replies arrive in WhatsApp-style markup (*bold*, plain line breaks)
// because the same agent also serves WhatsApp. On the web we render the
// emphasis properly instead of leaking literal asterisks into bubbles.
// Only single/double-star spans are parsed — everything else stays text,
// so nothing here can inject markup.
const EMPHASIS = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*)/g;

export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(EMPHASIS).map((part, index) => {
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**'))
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*'))
          return <strong key={index}>{part.slice(1, -1)}</strong>;
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
