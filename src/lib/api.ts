import type { AgentResponse } from '../shared/types/agent';

export interface ChatResponse extends AgentResponse {
  error?: string;
}

export interface VoiceResponse extends ChatResponse {
  heard?: string;
}

const SESSION_KEY = 'cloom-session-id';

export function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'default';
  }
}

const sessionHeaders = () => ({ 'x-session-id': getSessionId() });

export async function sendChat(userId: string, text: string): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ phone: userId, text, sessionId: getSessionId() }),
  });
  return (await res.json()) as ChatResponse;
}

export async function sendVoiceBlob(userId: string, blob: Blob): Promise<VoiceResponse> {
  const res = await fetch(`/api/voice?phone=${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: sessionHeaders(),
    body: blob,
  });
  return (await res.json()) as VoiceResponse;
}

export async function resetDemo(userId: string): Promise<{ ok?: boolean; text?: string; error?: string }> {
  const res = await fetch('/api/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ userId, sessionId: getSessionId() }),
  });
  return (await res.json()) as { ok?: boolean; text?: string; error?: string };
}

export interface HotelSnapshot {
  hotel: string;
  occupancy: string;
  revenueToday: number;
  currency: string;
  openTasks: number;
  pendingApprovals: number;
  blockedDepartures: number;
  rooms: Array<{ number: string; type: string; status: string; rate: number }>;
  arrivals: Array<{ guest: string; roomType: string; eta: string; vip: boolean }>;
  tasks: Array<{ id: string; title: string; assignee: string; priority: string }>;
  approvals: Array<{ id: string; title: string }>;
  folios: Array<{ room: string; guest: string; balance: number; status: string }>;
  audit: Array<{ at: string; actor: string; action: string; detail: string }>;
}

export async function getState(): Promise<HotelSnapshot> {
  const res = await fetch('/api/state', { headers: sessionHeaders() });
  return (await res.json()) as HotelSnapshot;
}
