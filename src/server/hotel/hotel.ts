// PropertyBackend tool surface. The in-app copilot and Next.js API routes call these tools.
// In production this interface is a REST adapter to the hotel platform; no private Cloom code lives here.
import type { AuditEntry, HotelState } from '../../shared/types/hotel';
import type { HotelContext, UndoItem } from './context';
import { createSeedState } from './seed';
import type { HotelTools } from './tools';
import { createDashboardTools } from './tools/dashboard';
import { createRevenueTools } from './tools/revenue';
import { createFolioTools } from './tools/folios';
import { createRoomTools } from './tools/rooms';
import { createTaskTools } from './tools/tasks';
import { createAdminTools } from './tools/admin';
import { createFrontdeskTools } from './tools/frontdesk';

export type { HotelTools } from './tools';

export interface HotelInstance {
  state: HotelState;
  tools: HotelTools;
  audit: AuditEntry[];
  log: (actor: string, action: string, detail: string) => void;
  /** Restore the seeded demo property in place (tools keep their state reference). */
  reset: () => void;
}

export function createHotel(): HotelInstance {
  const state = createSeedState();
  const audit: AuditEntry[] = [];
  const undoStack: UndoItem[] = [];
  const log = (actor: string, action: string, detail: string) =>
    audit.push({ at: new Date().toISOString(), actor, action, detail });

  const ctx: HotelContext = {
    state,
    audit,
    log,
    pushUndo: (item) => {
      undoStack.push(item);
    },
    popUndo: () => undoStack.pop(),
  };

  const tools: HotelTools = {
    ...createDashboardTools(ctx),
    ...createRevenueTools(ctx),
    ...createFolioTools(ctx),
    ...createRoomTools(ctx),
    ...createTaskTools(ctx),
    ...createAdminTools(ctx),
    ...createFrontdeskTools(ctx),
    // Index-signature fallback required by HotelTools; concrete tools above win at runtime.
  } as HotelTools;

  const reset = () => {
    const fresh = createSeedState();
    for (const key of Object.keys(state) as Array<keyof HotelState>) delete state[key];
    Object.assign(state, fresh);
    audit.length = 0;
    undoStack.length = 0;
    log('system', 'reset', 'Demo state restored to seed');
  };

  return { state, tools, audit, log, reset };
}
