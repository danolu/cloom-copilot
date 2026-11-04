import { useCallback } from 'react';
import { speakText } from '../lib/speech';

export function useTextToSpeech(soundEnabled: boolean) {
  const speak = useCallback(
    (text: string) => {
      if (!soundEnabled) return;
      speakText(text);
    },
    [soundEnabled],
  );
  return { speak };
}
