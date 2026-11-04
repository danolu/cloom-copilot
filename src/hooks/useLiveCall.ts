import { useCallback, useRef, useState } from 'react';
import { sendChat } from '../lib/api';
import { speakText } from '../lib/speech';
import type { Message } from '../components/copilot/types';

type OrbState = 'idle' | 'listening' | 'speaking';

interface UseLiveCallOptions {
  role: string;
  addMessage: (message: Omit<Message, 'id' | 'time'>) => void;
  addBotResponse: (
    res: { text?: string | null; buttons?: Message['buttons']; document?: Message['document'] },
    shouldSpeak?: boolean,
  ) => void;
}

export function useLiveCall({ role, addMessage, addBotResponse }: UseLiveCallOptions) {
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState('Connected • Hands-free');
  const [liveCaption, setLiveCaption] = useState('Listening for your command…');
  const [orbState, setOrbState] = useState<OrbState>('listening');
  const [callMuted, setCallMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const callingRef = useRef(false);
  const mutedRef = useRef(false);
  const speakingRef = useRef(false);

  const startContinuousListener = useCallback(() => {
    if (!callingRef.current || mutedRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setLiveCaption('Web Speech API is required for real-time voice calls (Chrome/Safari/Edge).');
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = 'en-US';
    recog.onstart = () => {
      setOrbState('listening');
      setCallStatus('Listening…');
    };
    recog.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          void handleCallSpeechRef.current(event.results[i][0].transcript);
          return;
        }
        interim += event.results[i][0].transcript;
      }
      if (interim) setLiveCaption(`"${interim}"`);
    };
    recog.onerror = () => {
      if (callingRef.current && !mutedRef.current) setTimeout(startContinuousListener, 600);
    };
    recog.onend = () => {
      if (callingRef.current && !mutedRef.current && !speakingRef.current) {
        setTimeout(startContinuousListener, 400);
      }
    };
    recognitionRef.current = recog;
    try {
      recog.start();
    } catch {
      // A previous recognition session may still be shutting down.
    }
    // handleCallSpeech is assigned below; the ref keeps the listener stable.
  }, []);

  const handleCallSpeech = useCallback(
    async (userText: string) => {
      if (!userText || !userText.trim()) return;
      setLiveCaption(`"${userText}"`);
      setOrbState('idle');
      setCallStatus('Thinking with Muse Spark…');
      addMessage({ sender: 'user', text: `🎙️ ${userText}`, isVoice: true });

      try {
        const res = await sendChat(role, userText);
        if (!res.text) return;
        addBotResponse(res, false);
        setLiveCaption(res.text);
        setOrbState('speaking');
        setCallStatus('Copilot Speaking…');
        speakingRef.current = true;

        if ('speechSynthesis' in window) {
          speakText(res.text, () => {
            speakingRef.current = false;
            if (callingRef.current) {
              setOrbState('listening');
              setCallStatus('Listening…');
              startContinuousListener();
            }
          });
        } else {
          setTimeout(() => {
            speakingRef.current = false;
            if (callingRef.current) startContinuousListener();
          }, 3000);
        }
      } catch {
        setCallStatus('Error connecting to AI');
      }
    },
    [addBotResponse, addMessage, role, startContinuousListener],
  );
  const handleCallSpeechRef = useRef(handleCallSpeech);
  handleCallSpeechRef.current = handleCallSpeech;

  const startVoiceCall = useCallback(() => {
    callingRef.current = true;
    mutedRef.current = false;
    setCallMuted(false);
    setIsCalling(true);
    setOrbState('listening');
    setCallStatus('Connected • Hands-free');
    // Start after state flush so the overlay is mounted.
    setTimeout(startContinuousListener, 0);
  }, [startContinuousListener]);

  const endVoiceCall = useCallback(() => {
    callingRef.current = false;
    setIsCalling(false);
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
      recognitionRef.current = null;
    }
  }, []);

  const toggleCallMute = useCallback(() => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setCallMuted(nextMuted);
    if (nextMuted) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Recognition may already be stopped.
        }
      }
      setCallStatus('Muted');
    } else {
      startContinuousListener();
    }
  }, [startContinuousListener]);

  return {
    isCalling,
    callStatus,
    liveCaption,
    orbState,
    callMuted,
    startVoiceCall,
    endVoiceCall,
    toggleCallMute,
  };
}
