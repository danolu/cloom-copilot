import { useRef, useState } from 'react';
import { sendVoiceBlob } from '../lib/api';
import type { Message } from '../components/copilot/types';

interface UseVoiceNoteOptions {
  role: string;
  handleSend: (text: string, isVoice?: boolean) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'time'>) => void;
  addBotResponse: (res: { text?: string | null; buttons?: Message['buttons']; document?: Message['document'] }) => void;
}

export function useVoiceNote({ role, handleSend, addMessage, addBotResponse }: UseVoiceNoteOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';
      recog.onstart = () => setIsRecording(true);
      recog.onresult = (event: any) => {
        void handleSend(event.results[0][0].transcript, true);
      };
      recog.onend = () => setIsRecording(false);
      recog.onerror = () => setIsRecording(false);
      recognitionRef.current = recog;
      recog.start();
      return;
    }

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        setIsRecording(true);
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            const res = await sendVoiceBlob(role, blob);
            if (res.heard) addMessage({ sender: 'user', text: res.heard, isVoice: true });
            addBotResponse(res);
          } catch {
            alert('Could not transcribe audio.');
          }
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
      })
      .catch(() => alert('Microphone access denied.'));
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped.
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return { isRecording, toggleRecording };
}
