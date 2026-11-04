'use client';

import { FiPhone, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { Button, IconButton } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';

interface CopilotHeaderProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  startVoiceCall: () => void;
}

export function CopilotHeader({ soundEnabled, setSoundEnabled, startVoiceCall }: CopilotHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <img src="/icon.png" alt="Cloom Copilot" width={44} height={32} />
        <div>
          <Typography variant="h2" as="div" className="brand-name">
            Azure Palms Hotel
          </Typography>
          <Typography variant="caption" tone="muted" as="div">
            Your property operations copilot
          </Typography>
        </div>
      </div>
      <div className="header-actions">
        <Tooltip label={soundEnabled ? 'Mute voice responses' : 'Unmute voice responses'}>
          <IconButton
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Mute voice responses' : 'Unmute voice responses'}
          >
            {soundEnabled ? <FiVolume2 aria-hidden /> : <FiVolumeX aria-hidden />}
          </IconButton>
        </Tooltip>
        <Button variant="primary" onClick={startVoiceCall}>
          <FiPhone aria-hidden /> Call Copilot
        </Button>
      </div>
    </header>
  );
}
