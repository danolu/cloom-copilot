import { Mic, MicOff, PhoneOff } from 'lucide-react';

interface LiveCallOverlayProps {
  isCalling: boolean;
  callStatus: string;
  liveCaption: string;
  orbState: 'idle' | 'listening' | 'speaking';
  callMuted: boolean;
  toggleCallMute: () => void;
  endVoiceCall: () => void;
}

export function LiveCallOverlay({
  isCalling,
  callStatus,
  liveCaption,
  orbState,
  callMuted,
  toggleCallMute,
  endVoiceCall,
}: LiveCallOverlayProps) {
  if (!isCalling) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '48px 24px 40px',
        zIndex: 100,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Cloom Copilot Voice</div>
        <div style={{ fontSize: 14, color: 'var(--accent-emerald)', marginTop: 6, fontWeight: 500 }}>{callStatus}</div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: 180,
          height: 180,
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #10b981 0%, #059669 70%, #047857 100%)',
            boxShadow: '0 0 35px rgba(5, 150, 105, 0.35)',
            animation:
              orbState === 'speaking'
                ? 'orbSpeak 1s infinite alternate ease-in-out'
                : orbState === 'listening'
                  ? 'orbListen 2s infinite ease-in-out'
                  : 'none',
          }}
        />
      </div>

      <div
        style={{
          maxWidth: '90%',
          minHeight: 50,
          textAlign: 'center',
          color: '#334155',
          fontSize: 15,
          lineHeight: 1.4,
        }}
      >
        {liveCaption}
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <button
          onClick={toggleCallMute}
          style={{
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {callMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={endVoiceCall}
          style={{
            background: 'var(--danger)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 58,
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
          }}
          title="Hang up"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}
