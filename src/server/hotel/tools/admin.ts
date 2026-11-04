import type { HotelContext } from '../context';
import type { HotelTools } from '../tools';
import type { TeamMember, UserRole } from '../../../shared/types/hotel';
import { ROLES } from '../users';

export function createAdminTools(
  ctx: HotelContext,
): Pick<
  HotelTools,
  'list_team' | 'get_settings' | 'add_team_member' | 'remove_team_member' | 'update_setting' | 'undo_last'
> {
  const { state, log, pushUndo } = ctx;
  return {
    list_team: async () => ({ team: state.team }),
    get_settings: async () => ({ settings: state.settings }),

    // --- writes (confirm-gated + role-gated in the agent layer) ---
    add_team_member: async ({ name, phone, role }: { name: string; phone?: string; role?: string }) => {
      const userRole = (ROLES as readonly string[]).includes(role || '') ? (role as UserRole) : 'FRONT_DESK';
      const member: TeamMember = { name, phone: phone || '—', role: userRole };
      state.team.push(member);
      pushUndo({
        label: `add team member ${name}`,
        undo: () => {
          state.team = state.team.filter((m) => m !== member);
        },
      });
      log('admin', 'add_team_member', `${name} (${member.role})`);
      return { ok: true, member };
    },
    remove_team_member: async ({ name }: { name: string }) => {
      const m = state.team.find((x) => x.name.toLowerCase() === String(name).toLowerCase());
      if (!m) throw new Error(`Team member ${name} not found`);
      state.team = state.team.filter((x) => x !== m);
      pushUndo({ label: `remove ${name}`, undo: () => state.team.push(m) });
      log('admin', 'remove_team_member', name);
      return { ok: true, removed: m };
    },
    update_setting: async ({ key, value }: { key: string; value: string | boolean }) => {
      if (!(key in state.settings))
        throw new Error(`Unknown setting ${key}. Known: ${Object.keys(state.settings).join(', ')}`);
      const prev = state.settings[key];
      state.settings[key] = value === 'true' ? true : value === 'false' ? false : value;
      pushUndo({
        label: `setting ${key}`,
        undo: () => {
          state.settings[key] = prev;
        },
      });
      log('admin', 'update_setting', `${key}=${value}`);
      return { ok: true, key, value: state.settings[key] };
    },
    undo_last: async () => {
      const item = ctx.popUndo();
      if (!item) return { ok: false, message: 'Nothing to undo.' };
      item.undo();
      log('admin', 'undo_last', item.label);
      return { ok: true, undone: item.label };
    },
  };
}
