import { Phone, Volume2, VolumeX } from 'lucide-react';

interface CopilotHeaderProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  startVoiceCall: () => void;
}

export function CopilotHeader({ soundEnabled, setSoundEnabled, startVoiceCall }: CopilotHeaderProps) {
  return (
    <header
      style={{
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/icon.png" alt="Cloom Copilot" width={44} height={32} style={{ objectFit: 'contain' }} />
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Azure Palms Hotel
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: '#ecfdf5',
                color: 'var(--accent-emerald)',
                padding: '2px 7px',
                borderRadius: 10,
                border: '1px solid #a7f3d0',
              }}
            >
              Meta AI Demo
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Meta Muse Spark • Wonder • Voice Transcribe
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={soundEnabled ? 'Mute voice responses' : 'Unmute voice responses'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button
          onClick={startVoiceCall}
          style={{
            background: 'var(--accent-emerald)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 13,
            border: 'none',
            borderRadius: 18,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(5, 150, 105, 0.2)',
          }}
        >
          <Phone size={15} />
          <span>Call Copilot</span>
        </button>
      </div>
    </header>
  );
}
