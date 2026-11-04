import { Typography } from '../ui/Typography';

// Shown while the agent turn is in flight. /api/chat is not streamed (the
// agent decides, runs tools, then replies), so this is the honest signal
// that a response is being composed.
export function TypingIndicator() {
  return (
    <div className="message bot" role="status" aria-label="Copilot is typing">
      <div className="bubble typing-bubble">
        <span className="typing-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <Typography variant="caption" tone="muted" as="span">
          Copilot is typing
        </Typography>
      </div>
    </div>
  );
}
