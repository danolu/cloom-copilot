import { createHotel, type HotelInstance } from './hotel/hotel';
import { createAgent, type AgentInstance } from './agent/agent';

export interface CopilotSession {
  hotel: HotelInstance;
  agent: AgentInstance;
}

// Per-judge session isolation: each browser session gets its own in-memory
// hotel + agent, so judges don't mutate each other's demo. Still no backend —
// sessions live in this process and reset on restart/redeploy.
declare global {
  var __cloomSessions: Map<string, CopilotSession> | undefined;
}

const sessions: Map<string, CopilotSession> = (globalThis.__cloomSessions ??= new Map());
const MAX_SESSIONS = 100;

export function getSession(sessionId?: string | null): CopilotSession {
  const id = sessionId && /^[a-zA-Z0-9_-]{8,64}$/.test(sessionId) ? sessionId : 'default';
  let session = sessions.get(id);
  if (!session) {
    if (sessions.size >= MAX_SESSIONS) {
      const oldest = sessions.keys().next().value;
      if (oldest && oldest !== 'default') sessions.delete(oldest);
    }
    const hotel = createHotel();
    session = { hotel, agent: createAgent(hotel) };
    sessions.set(id, session);
  }
  return session;
}

export function sessionIdFrom(req: Request, body?: Record<string, unknown> | null): string | null {
  const fromBody = body?.sessionId;
  if (typeof fromBody === 'string') return fromBody;
  return req.headers.get('x-session-id');
}

export function resetSession(sessionId?: string | null): CopilotSession {
  const session = getSession(sessionId);
  session.hotel.reset();
  session.agent.pending.clear();
  return session;
}

// Default session, kept for server-side callers that don't carry a session id.
const defaultSession = getSession('default');
export const hotel = defaultSession.hotel;
export const agent = defaultSession.agent;
