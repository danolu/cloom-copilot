'use client';

import { FiMic, FiMicOff, FiPhoneOff } from 'react-icons/fi';
import { IconButton } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';

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
    <div className="live-call" role="dialog" aria-label="Live voice call with copilot">
      <div>
        <Typography variant="h1">Cloom Copilot Voice</Typography>
        <Typography variant="body-sm" tone="accent" as="div" className="call-status">
          {callStatus}
        </Typography>
      </div>

      <div className={`live-call-orb ${orbState}`} aria-hidden />

      <Typography variant="body" as="div" className="call-caption">
        {liveCaption}
      </Typography>

      <div className="call-controls">
        <Tooltip label={callMuted ? 'Unmute' : 'Mute'}>
          <IconButton size="lg" onClick={toggleCallMute} aria-label={callMuted ? 'Unmute call' : 'Mute call'}>
            {callMuted ? <FiMicOff aria-hidden /> : <FiMic aria-hidden />}
          </IconButton>
        </Tooltip>
        <Tooltip label="Hang up">
          <IconButton variant="danger" size="lg" className="btn-hangup" onClick={endVoiceCall} aria-label="Hang up">
            <FiPhoneOff aria-hidden />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
