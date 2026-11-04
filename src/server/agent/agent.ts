import { PERMISSIONS, WRITE_TOOLS } from '../hotel/permissions';
import { TOOL_SCHEMAS } from '../hotel/schemas';
import { USERS } from '../hotel/users';
import type { HotelInstance } from '../hotel/hotel';
import { decideWithSpark, metaConfigured } from '../ai/meta-client';
import type { User } from '../../shared/types/hotel';
import type { AgentResponse, ChatTurn, Decision, ToolSchema } from '../../shared/types/agent';
import { formatToolResult } from './format';
import { previewTool } from './preview';
import {
  applyDraftAnswer,
  applyDraftCorrections,
  draftFromArgs,
  draftToArgs,
  nextDraftField,
  questionFor,
  roomTypeOptions,
  type ReservationDraft,
} from './reservation-draft';

// Staff identity resolution. Access is strictly permission-driven based on role.
export const userOf = (userId: string): User | null => USERS[userId] || null;

// Recent messages kept per staff member so follow-ups like "do the same for
// 205" resolve against earlier turns. 12 messages ≈ 6 exchanges. This is
// conversational context only — hotel state lives in the HotelInstance.
export const HISTORY_LIMIT = 12;

export interface AgentInstance {
  handle: (userId: string, text: string, messageId?: string | null) => Promise<AgentResponse>;
  pending: Map<string, Decision>;
  drafts: Map<string, ReservationDraft>;
  history: Map<string, ChatTurn[]>;
  userOf: (userId: string) => User | null;
}

// Conversation engine for the hotel operations copilot.
// Role gating + confirm-before-write live here, so no caller (and no model) can bypass them.
export type DecideFn = (text: string, toolSchemas: ToolSchema[], history: ChatTurn[]) => Promise<Decision>;

// `decide` is injectable only so tests can stub Muse Spark's JSON response.
// Production always uses decideWithSpark — there is no offline/local decision path.
export function createAgent(hotel: HotelInstance, options: { decide?: DecideFn } = {}): AgentInstance {
  const decide = options.decide;
  const pending = new Map<string, Decision>();
  const drafts = new Map<string, ReservationDraft>();
  const history = new Map<string, ChatTurn[]>();
  const seen = new Set<string>();

  const allowed = (user: User, tool: string): boolean => (PERMISSIONS[tool] || []).includes(user.role);
  const withRole = (user: User, d: Decision): Decision =>
    d.tool === 'get_role_briefing' ? { ...d, args: { ...d.args, role: user.role } } : d;

  async function run(_userId: string, user: User, tool: string, args: any): Promise<AgentResponse> {
    const result = await hotel.tools[tool](args);
    return { text: formatToolResult(tool, result), document: result.document || undefined };
  }

  // Execute a validated batch in order. Stops at the first failure and says
  // exactly what was applied and what was skipped — earlier steps are NOT
  // rolled back (each tool already wrote its own audit entry).
  async function runBatch(userId: string, user: User, actions: Decision[]): Promise<AgentResponse> {
    const lines: string[] = [];
    let document: AgentResponse['document'];
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      try {
        const out = await run(userId, user, action.tool!, action.args);
        lines.push(`${i + 1}. ${out.text}`);
        if (out.document) document = out.document;
      } catch (e: any) {
        lines.push(`${i + 1}. ⚠️ ${e.message} — stopped here: earlier steps were applied, later steps were skipped.`);
        break;
      }
    }
    return { text: lines.join('\n'), document };
  }

  function remember(userId: string, userText: string, assistantText: string): void {
    const turns = history.get(userId) ?? [];
    turns.push({ role: 'user', content: userText }, { role: 'assistant', content: assistantText });
    history.set(userId, turns.slice(-HISTORY_LIMIT));
  }

  async function handle(userId: string, text: string, messageId?: string | null): Promise<AgentResponse> {
    if (messageId) {
      if (seen.has(messageId)) return { text: null, duplicate: true };
      seen.add(messageId);
    }
    const out = await respond(userId, text);
    if (out.text && userOf(userId)) remember(userId, text.trim(), out.text);
    return out;
  }

  async function respond(userId: string, text: string): Promise<AgentResponse> {
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
        if (action.actions?.length) {
          if (action.actions.some((a) => !a.tool || !hotel.tools[a.tool] || !allowed(user, a.tool))) {
            return { text: `⛔ ${user.role} cannot do that.` };
          }
          return runBatch(userId, user, action.actions);
        }
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

    // Guided reservation draft: while a draft is open, every message is an
    // answer to the current question (or a correction / cancel). Spark is
    // not consulted until the draft completes or is discarded.
    if (drafts.has(userId)) {
      const draft = drafts.get(userId)!;
      if (/^(cancel|stop|never\s*mind)/i.test(clean)) {
        drafts.delete(userId);
        return { text: 'No problem — reservation draft discarded. Nothing was created.' };
      }
      const currentField = nextDraftField(draft);
      if (/^(confirm|yes|✅)/i.test(clean)) {
        return {
          text: `We're still collecting the reservation details${currentField ? ` — ${questionFor(currentField, draft, hotel)}` : ''}`,
        };
      }
      const canApproveDiscount = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
      let note = '';
      if (applyDraftCorrections(draft, clean, hotel, { canApproveDiscount })) {
        note = 'Updated. ';
      } else if (currentField) {
        const result = applyDraftAnswer(draft, currentField, clean, hotel, { canApproveDiscount });
        if (!result.ok) return { text: result.error };
      }
      const missing = nextDraftField(draft);
      if (missing) return { text: note + questionFor(missing, draft, hotel) };
      drafts.delete(userId);
      if (!allowed(user, 'create_reservation')) {
        return { text: `⛔ Sorry ${user.name}, the ${user.role} role can't create reservations. Draft discarded.` };
      }
      const args = draftToArgs(draft);
      pending.set(userId, { tool: 'create_reservation', args });
      return {
        text: `${previewTool('create_reservation', args, hotel)}\nReply *confirm* ✅ or *cancel* ❌`,
        buttons: [
          { id: 'confirm', title: '✅ Confirm' },
          { id: 'cancel', title: '❌ Cancel' },
        ],
      };
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
      decision = await (decide
        ? decide(clean, TOOL_SCHEMAS, history.get(userId) ?? [])
        : decideWithSpark(clean, TOOL_SCHEMAS, history.get(userId) ?? []));
    } catch (e: any) {
      return { text: `⚠️ Meta Model API unavailable: ${e.message}. Check the key/base URL and try again.` };
    }

    // Multi-intent batch: Spark returns {"actions":[...]} for compound requests.
    // The whole batch is validated up front (tools exist, role may use every
    // one) so a batch never half-starts for permission reasons. If any step
    // writes, the entire plan waits behind ONE grouped confirmation.
    if (Array.isArray(decision.actions) && decision.actions.length > 0) {
      const actions = decision.actions.filter((a) => a && a.tool).map((a) => withRole(user, a));
      if (actions.length !== decision.actions.length || actions.some((a) => !hotel.tools[a.tool!])) {
        return { text: '⚠️ I could not map part of that request to an available action, so nothing was changed.' };
      }
      const blockedAction = actions.find((a) => !allowed(user, a.tool!));
      if (blockedAction) {
        return {
          text: `⛔ Sorry ${user.name}, the ${user.role} role can't use *${blockedAction.tool}*. Nothing in that batch was run.`,
        };
      }
      if (actions.some((a) => WRITE_TOOLS.has(a.tool!))) {
        pending.set(userId, { actions });
        return {
          text:
            `Here's the plan — ${actions.length} steps in order:\n` +
            actions.map((a, i) => `${i + 1}. ${previewTool(a.tool!, a.args, hotel)}`).join('\n') +
            '\nReply *confirm* ✅ or *cancel* ❌',
          buttons: [
            { id: 'confirm', title: '✅ Confirm' },
            { id: 'cancel', title: '❌ Cancel' },
          ],
        };
      }
      return runBatch(userId, user, actions);
    }

    if (decision.reply || !decision.tool || !hotel.tools[decision.tool]) {
      return { text: decision.reply || 'How can I help?' };
    }

    const tool = decision.tool;
    decision = withRole(user, decision);

    if (!allowed(user, tool)) {
      return {
        text: `⛔ Sorry ${user.name}, the ${user.role} role can't use *${tool}*. Ask an admin if you need this done.`,
      };
    }

    // Reservation requests with missing details open the guided draft flow
    // instead of executing with guessed defaults.
    if (tool === 'create_reservation') {
      const draft = draftFromArgs(decision.args);
      if (draft.roomType) {
        const hit = roomTypeOptions(hotel).find((o) => o.type.toLowerCase() === draft.roomType!.toLowerCase());
        draft.roomType = hit?.type;
      }
      const missing = nextDraftField(draft);
      if (missing) {
        drafts.set(userId, draft);
        return { text: questionFor(missing, draft, hotel) };
      }
      decision = { ...decision, args: draftToArgs(draft) };
    }

    if (WRITE_TOOLS.has(tool)) {
      pending.set(userId, decision);
      return {
        text: `${previewTool(tool, decision.args, hotel)}\nReply *confirm* ✅ or *cancel* ❌`,
        buttons: [
          { id: 'confirm', title: '✅ Confirm' },
          { id: 'cancel', title: '❌ Cancel' },
        ],
      };
    }
    try {
      return await run(userId, user, tool, decision.args);
    } catch (e: any) {
      return { text: `⚠️ ${e.message}` };
    }
  }

  return { handle, pending, drafts, history, userOf };
}
