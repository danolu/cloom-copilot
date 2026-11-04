'use client';

import { FiCheckCircle, FiDownload, FiFileText, FiMic, FiVolume2, FiXCircle } from 'react-icons/fi';
import { Button, IconButton } from '../ui/Button';
import { RichText } from '../ui/RichText';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';
import type { Message } from './types';

interface ChatMessageProps {
  message: Message;
  handleSend: (text: string) => void;
  speak: (text: string) => void;
}

export function ChatMessage({ message: m, handleSend, speak }: ChatMessageProps) {
  return (
    <div className={`message ${m.sender}`}>
      <div className="bubble">{m.sender === 'bot' ? <RichText text={m.text} /> : m.text}</div>

      {m.document && (
        <div className="doc-card">
          <span className="doc-card-title">
            <FiFileText aria-hidden /> <strong>{m.document.filename}</strong>
          </span>
          <a
            href={`data:${m.document.mime};charset=utf-8,${encodeURIComponent(m.document.content)}`}
            download={m.document.filename}
          >
            <FiDownload aria-hidden /> Download
          </a>
        </div>
      )}

      {m.buttons && m.buttons.length > 0 && (
        <div className="message-actions">
          {m.buttons.map((b) => (
            <Button
              key={b.id}
              variant={b.id === 'cancel' ? 'danger-soft' : 'primary'}
              size="sm"
              onClick={() => handleSend(b.id)}
            >
              {b.id === 'cancel' ? <FiXCircle aria-hidden /> : <FiCheckCircle aria-hidden />}
              {b.title}
            </Button>
          ))}
        </div>
      )}

      <div className="message-meta">
        <Typography variant="caption" tone="muted" as="span">
          {m.time}
        </Typography>
        {m.isVoice && <FiMic aria-hidden />}
        {m.sender === 'bot' && (
          <Tooltip label="Read aloud">
            <IconButton variant="ghost" size="sm" onClick={() => speak(m.text)} aria-label="Read message aloud">
              <FiVolume2 aria-hidden />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
