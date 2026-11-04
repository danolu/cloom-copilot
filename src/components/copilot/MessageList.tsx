import type { RefObject } from 'react';
import { CheckCircle, Download, FileText, Mic, Volume2, XCircle } from 'lucide-react';
import type { Message } from './types';

interface MessageListProps {
  messages: Message[];
  chatEndRef: RefObject<HTMLDivElement | null>;
  handleSend: (text: string) => void;
  speak: (text: string) => void;
}

export function MessageList({ messages, chatEndRef, handleSend, speak }: MessageListProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'var(--bg-chat)',
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '84%',
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 14,
              fontSize: 14,
              lineHeight: 1.48,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: m.sender === 'user' ? 'var(--bg-bubble-user)' : 'var(--bg-bubble-bot)',
              color: m.sender === 'user' ? 'var(--text-user)' : 'var(--text-bot)',
              border: m.sender === 'bot' ? '1px solid var(--border-subtle)' : 'none',
              boxShadow: m.sender === 'user' ? '0 1px 3px rgba(5, 150, 105, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
              borderBottomRightRadius: m.sender === 'user' ? 2 : 14,
              borderBottomLeftRadius: m.sender === 'bot' ? 2 : 14,
            }}
          >
            {m.text}
          </div>

          {/* Document attachment */}
          {m.document && (
            <div
              style={{
                marginTop: 8,
                background: '#f0fdf4',
                border: '1px dashed #059669',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}>
                <FileText size={16} color="var(--accent-emerald)" />
                <span>
                  <strong>{m.document.filename}</strong>
                </span>
              </div>
              <a
                href={`data:${m.document.mime};charset=utf-8,${encodeURIComponent(m.document.content)}`}
                download={m.document.filename}
                style={{
                  color: 'var(--accent-emerald)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Download size={13} /> Download
              </a>
            </div>
          )}

          {/* Interactive Confirm/Cancel Buttons */}
          {m.buttons && m.buttons.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {m.buttons.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSend(b.id)}
                  style={{
                    background: b.id === 'cancel' ? 'var(--danger-bg)' : 'var(--accent-emerald)',
                    color: b.id === 'cancel' ? 'var(--danger-text)' : '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    border: b.id === 'cancel' ? '1px solid #fecaca' : 'none',
                    padding: '6px 14px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  {b.id === 'cancel' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  {b.title}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: 10,
              color: 'var(--text-secondary)',
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <span>{m.time}</span>
            {m.isVoice && <Mic size={11} color="var(--accent-emerald)" />}
            {m.sender === 'bot' && (
              <button
                onClick={() => speak(m.text)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                title="Read aloud"
              >
                <Volume2 size={12} />
              </button>
            )}
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}
