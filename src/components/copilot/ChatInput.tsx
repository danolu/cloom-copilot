import { Mic, MicOff, Send } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isRecording: boolean;
  toggleRecording: () => void;
  handleSend: () => void;
}

export function ChatInput({ inputText, setInputText, isRecording, toggleRecording, handleSend }: ChatInputProps) {
  return (
    <footer
      style={{
        padding: '10px 14px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <button
        onClick={toggleRecording}
        style={{
          background: isRecording ? 'var(--danger)' : '#f1f5f9',
          border: `1px solid ${isRecording ? 'var(--danger)' : 'var(--border-subtle)'}`,
          color: isRecording ? '#ffffff' : 'var(--accent-emerald)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          animation: isRecording ? 'pulseGlow 1.2s infinite' : 'none',
        }}
        title={isRecording ? 'Stop recording voice' : 'Record voice note'}
      >
        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: 22,
          padding: '4px 14px',
        }}
      >
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={
            isRecording ? '🎙️ Listening to voice note…' : 'Ask anything, post folio charges, or manage rooms…'
          }
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 14,
            outline: 'none',
            padding: '8px 0',
          }}
        />
      </div>

      <button
        onClick={handleSend}
        style={{
          background: 'var(--accent-emerald)',
          border: 'none',
          color: '#ffffff',
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        title="Send"
      >
        <Send size={16} />
      </button>
    </footer>
  );
}
