import { PERMISSIONS, WRITE_TOOLS } from '../hotel/permissions';
import { TOOL_SCHEMAS } from '../hotel/schemas';
import { USERS } from '../hotel/users';
import type { HotelInstance } from '../hotel/hotel';
import { decideWithSpark, metaConfigured } from '../ai/meta-client';
import type { User } from '../../shared/types/hotel';
import type { AgentResponse, Decision, ToolSchema } from '../../shared/types/agent';
import { formatToolResult } from './format';
import { previewTool } from './preview';

// Staff identity resolution. Access is strictly permission-driven based on role.
export const userOf = (userId: string): User | null => USERS[userId] || null;

export interface AgentInstance {
  handle: (userId: string, text: string, messageId?: string | null) => Promise<AgentResponse>;
  pending: Map<string, Decision>;
  userOf: (userId: string) => User | null;
}

// Conversation engine for the hotel operations copilot.
// Role gating + confirm-before-write live here, so no caller (and no model) can bypass them.
export type DecideFn = (text: string, toolSchemas: ToolSchema[]) => Promise<Decision>;

// `decide` is injectable only so tests can stub Muse Spark's JSON response.
// Production always uses decideWithSpark — there is no offline/local decision path.
export function createAgent(hotel: HotelInstance, options: { decide?: DecideFn } = {}): AgentInstance {
  const decide = options.decide;
  const pending = new Map<string, Decision>();
  const seen = new Set<string>();

  const allowed = (user: User, tool: string): boolean => (PERMISSIONS[tool] || []).includes(user.role);

  async function run(_userId: string, user: User, tool: string, args: any): Promise<AgentResponse> {
    const result = await hotel.tools[tool](args);
    return { text: formatToolResult(tool, result), document: result.document || undefined };
  }

  async function handle(userId: string, text: string, messageId?: string | null): Promise<AgentResponse> {
    if (messageId) {
      if (seen.has(messageId)) return { text: null, duplicate: true };
      seen.add(messageId);
    }
    const user = userOf(userId);
    if (!user) {
      return {
        text: '👋 Staff member not recognized. Please select an active staff role from the copilot header.',
      };
    }
    const clean = text.trim();

    if (pending.has(userId)) {
      const action = pending.get(userId)!;
      if (/^(confirm|yes|✅)/i.test(clean)) {
        pending.delete(userId);
        if (!action.tool || !allowed(user, action.tool)) return { text: `⛔ ${user.role} cannot do that.` };
        try {
          return await run(userId, user, action.tool, action.args);
        } catch (e: any) {
          return { text: `⚠️ ${e.message}` };
        }
      }
      if (/^(cancel|no|❌)/i.test(clean)) {
        pending.delete(userId);
        return { text: 'Cancelled. Nothing was changed.' };
      }
      pending.delete(userId);
    }

    // Bare confirm/cancel with nothing waiting must not become a model-chosen action.
    if (/^(confirm|yes|✅)/i.test(clean)) {
      return { text: 'Nothing to confirm right now — tell me what you would like to do.' };
    }
    if (/^(cancel|no|❌)/i.test(clean)) {
      return { text: 'Nothing to cancel — no action is waiting for approval.' };
    }

    let decision: Decision;
    if (!decide && !metaConfigured()) {
      return { text: '⚠️ Meta Model API not configured. Set MODEL_API_KEY (or META_API_KEY) to run the copilot.' };
    }
    try {
      decision = await (decide ? decide(clean, TOOL_SCHEMAS) : decideWithSpark(clean, TOOL_SCHEMAS));
    } catch (e: any) {
      return { text: `⚠️ Meta Model API unavailable: ${e.message}. Check the key/base URL and try again.` };
    }
    if (decision.reply || !decision.tool || !hotel.tools[decision.tool]) {
      return { text: decision.reply || 'How can I help?' };
    }

    if (decision.tool === 'get_role_briefing') {
      decision.args = { ...decision.args, role: user.role };
    }

    if (!allowed(user, decision.tool)) {
      return {
        text: `⛔ Sorry ${user.name}, the ${user.role} role can't use *${decision.tool}*. Ask an admin if you need this done.`,
      };
    }

    if (WRITE_TOOLS.has(decision.tool)) {
      pending.set(userId, decision);
      return {
        text: `${previewTool(decision.tool, decision.args, hotel)}\nReply *confirm* ✅ or *cancel* ❌`,
        buttons: [
          { id: 'confirm', title: '✅ Confirm' },
          { id: 'cancel', title: '❌ Cancel' },
        ],
      };
    }
    try {
      return await run(userId, user, decision.tool, decision.args);
    } catch (e: any) {
      return { text: `⚠️ ${e.message}` };
    }
  }

  return { handle, pending, userOf };
}
