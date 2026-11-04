import { useCallback, useEffect, useRef, useState } from 'react';
import { resetDemo as resetDemoApi, sendChat } from '../lib/api';
import { ROLE_PRESETS } from '../components/copilot/role-presets';
import type { Message } from '../components/copilot/types';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME: Message = {
  id: 'welcome',
  sender: 'bot',
  text: 'Hi, I\'m your **Azure Palms** copilot. Ask me things like *"How many rooms are free?"* or *"Who\'s arriving today?"* — or say *"Create a reservation"* and I\'ll walk you through it, one step at a time. You can type or talk.',
  time: 'Just now',
};

const stored = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export function useCopilotChat(speak: (text: string) => void) {
  const [role, setRole] = useState(() => stored<string>('cloom-role') || 'demo-admin');
  const [messages, setMessages] = useState<Message[]>(() => stored<Message[]>('cloom-messages') || [WELCOME]);
  // A count, not a boolean: chips and role switches can keep a second turn
  // in flight while the first resolves, and the indicator must not flicker.
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('cloom-role', JSON.stringify(role));
    } catch {
      /* storage unavailable */
    }
  }, [role]);

  useEffect(() => {
    try {
      localStorage.setItem('cloom-messages', JSON.stringify(messages.slice(-100)));
    } catch {
      /* storage unavailable */
    }
  }, [messages]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'time'> & { id?: string; time?: string }) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: message.id ?? `${Date.now()}-${prev.length}`, time: message.time ?? now() },
    ]);
  }, []);

  const addBotResponse = useCallback(
    (
      res: { text?: string | null; buttons?: Message['buttons']; document?: Message['document'] },
      // Replies are NOT read aloud by default — speech is opt-in via the
      // speaker toggle, the per-message read-aloud button, or a live call.
      shouldSpeak = false,
    ) => {
      if (!res.text) return;
      addMessage({ sender: 'bot', text: res.text, buttons: res.buttons, document: res.document });
      if (shouldSpeak) speak(res.text);
    },
    [addMessage, speak],
  );

  const handleSend = useCallback(
    async (text: string, isVoice = false, roleOverride?: string) => {
      if (!text || !text.trim()) return;
      addMessage({ sender: 'user', text, isVoice });
      setPendingCount((count) => count + 1);
      try {
        const res = await sendChat(roleOverride ?? role, text);
        addBotResponse(res);
      } catch {
        addMessage({ sender: 'bot', text: 'An error occurred communicating with the agent server.' });
      } finally {
        setPendingCount((count) => count - 1);
      }
    },
    [addBotResponse, addMessage, role],
  );

  const onRoleChange = useCallback(
    (newRole: string) => {
      setRole(newRole);
      const roleInfo = ROLE_PRESETS[newRole] || ROLE_PRESETS['demo-admin'];
      addMessage({ sender: 'bot', text: `Switched identity to **${roleInfo.name} — ${roleInfo.title}**.` });
      void handleSend('briefing', false, newRole);
    },
    [addMessage, handleSend],
  );

  const resetDemo = useCallback(async () => {
    setPendingCount((count) => count + 1);
    try {
      const res = await resetDemoApi(role);
      if (res.error) {
        addMessage({ sender: 'bot', text: `Reset failed: ${res.error}` });
        return;
      }
      setMessages([
        WELCOME,
        { id: `reset-${Date.now()}`, sender: 'bot', text: res.text || 'Demo reset.', time: now() },
      ]);
    } finally {
      setPendingCount((count) => count - 1);
    }
  }, [addMessage, role]);

  return {
    role,
    messages,
    isResponding: pendingCount > 0,
    resetDemo,
    inputText,
    setInputText,
    chatEndRef,
    addMessage,
    addBotResponse,
    handleSend,
    onRoleChange,
  };
}
