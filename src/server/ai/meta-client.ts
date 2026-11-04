// Meta Model API client — the ONLY AI provider in this project.
// Without an API key the agent refuses with a clear configuration error:
// every decision goes through Muse Spark, there is no local substitute.
import type { ChatTurn, Decision, ToolSchema } from '../../shared/types/agent';
import type { DashboardResult } from '../../shared/types/hotel';

const base = () => (process.env.META_API_BASE_URL || 'https://api.meta.ai/v1').replace(/\/$/, '');
const apiKey = () => process.env.META_API_KEY || process.env.MODEL_API_KEY; // MODEL_API_KEY is Meta's canonical name
export const metaConfigured = (): boolean => Boolean(apiKey());
export const metaApiBase = base;
export const metaApiKey = apiKey;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function chat(model: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${base()}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`Meta Model API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? '';
}

// Ask Muse Spark for one structured decision: {"tool": "...", "args": {...}}
// or {"reply": "..."} when no tool is needed. Recent conversation history is
// included so follow-ups ("do the same for room 205") resolve, and a request
// with several distinct actions comes back as {"actions": [...]} in order.
export async function decideWithSpark(
  text: string,
  toolSchemas: ToolSchema[],
  history: ChatTurn[] = [],
): Promise<Decision> {
  const content = await chat(process.env.META_AGENT_MODEL || 'muse-spark-1.3', [
    {
      role: 'system',
      content:
        'You are a hotel operations copilot. The messages before the final user message are recent ' +
        'conversation history: use them to resolve follow-ups like "do the same for room 205" or "and for 206 too". ' +
        'Reply with ONLY a JSON object: {"tool":"<name>","args":{...}} to call one tool, ' +
        '{"actions":[{"tool":"<name>","args":{...}}]} with one entry per action (in the order requested) ' +
        'when the final message asks for several distinct actions, or {"reply":"<short friendly text>"} to just answer. ' +
        'For a new reservation, return the create_reservation tool with whatever details were given ' +
        '(guest, checkin, nights, roomType, discountPercent) and omit the rest — never invent a guest ' +
        'name or date; the copilot will ask follow-up questions for missing details. ' +
        'When the user asks for a briefing, morning update, or what to focus on, use get_role_briefing. ' +
        `Available tools: ${JSON.stringify(toolSchemas)}`,
    },
    ...history.slice(-12).map((turn): ChatMessage => ({ role: turn.role, content: turn.content.slice(0, 800) })),
    { role: 'user', content: text },
  ]);
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return { reply: content.trim() };
  try {
    return JSON.parse(match[0]) as Decision;
  } catch {
    return { reply: content.trim() };
  }
}

// Muse Wonder: one insight line for the morning digest (not raw numbers).
export async function digestInsight(dashboard: DashboardResult): Promise<string> {
  const content = await chat(process.env.META_DIGEST_MODEL || 'muse-wonder-1.0', [
    {
      role: 'system',
      content:
        'You write one punchy insight sentence for a hotel manager morning digest. Max 30 words. Name the most important thing to act on.',
    },
    { role: 'user', content: JSON.stringify(dashboard) },
  ]);
  return content.trim();
}
