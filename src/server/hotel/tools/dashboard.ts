import type { HotelContext } from '../context';
import type { HotelTools } from '../tools';
import type { UserRole } from '../../../shared/types/hotel';
import { businessAdvice } from '../advice';

export function createDashboardTools(
  ctx: HotelContext,
): Pick<HotelTools, 'get_dashboard' | 'get_role_briefing' | 'list_arrivals'> {
  const { state } = ctx;
  return {
    get_dashboard: async () => ({
      hotel: state.name,
      occupancy: `${state.rooms.filter((r) => r.status === 'occupied').length}/${state.rooms.length} rooms`,
      arrivalsToday: state.arrivals.length,
      openTasks: state.tasks.filter((t) => !t.done).length,
      pendingApprovals: state.approvals.filter((a) => a.status === 'pending').length,
      revenueToday: state.revenue.today,
      currency: state.revenue.currency,
    }),
    get_role_briefing: async ({ role }: { role?: UserRole } = {}) => {
      const activeRole = role || 'ADMIN';
      const dirtyRooms = state.rooms.filter((r) => r.status === 'dirty').map((r) => r.number);
      const cleanRooms = state.rooms.filter((r) => r.status === 'clean').map((r) => r.number);
      const openTasks = state.tasks.filter((t) => !t.done);
      const pendingApprovals = state.approvals.filter((a) => a.status === 'pending');

      if (activeRole === 'HOUSEKEEPING') {
        const hkTasks = openTasks.filter((t) => /housekeeping|clean|turn down/i.test(t.assignee || t.title));
        return {
          greeting: `🧹 Morning Kofi! Ready for today's turnarounds at ${state.name}.`,
          highlights: [
            dirtyRooms.length
              ? `🔴 ${dirtyRooms.length} dirty room(s) to clean: Room ${dirtyRooms.join(', ')} (Room 204 has priority for 2 PM check-in)`
              : '🎉 All rooms are clean!',
            hkTasks.length
              ? `📋 ${hkTasks.length} housekeeping task(s): ${hkTasks.map((t) => `${t.id} (${t.title})`).join(', ')}`
              : 'No special work orders.',
            `✅ ${cleanRooms.length} room(s) inspected and guest-ready`,
          ],
          actions: ['"Cleaned room 204"', '"Add $25 minibar charge to room 101"', '"Complete task T-2"'],
        };
      }

      if (activeRole === 'FRONT_DESK' || activeRole === 'CASHIER') {
        const unbilledFolios = Object.values(state.folios).filter((f) => f.status === 'OPEN' && f.balance > 0);
        return {
          greeting: `🛎️ Hello! Front desk & cashier briefing for ${state.name}:`,
          highlights: [
            `🧳 ${state.arrivals.length} arrival(s) expected today: ${state.arrivals.map((a) => `${a.guest} (${a.eta}${a.vip ? ' ⭐ VIP' : ''})`).join(', ')}`,
            `💳 ${unbilledFolios.length} active folio(s) with pending balances: Room 101 ($${state.folios['101']?.balance || 0}), Room 301 ($${state.folios['301']?.balance || 0})`,
            `🟢 ${cleanRooms.length} clean room(s) available for check-in (${cleanRooms.join(', ')})`,
          ],
          actions: [
            '"Show folio for room 101"',
            '"Settle folio for room 101 with credit card"',
            '"Check out room 101"',
          ],
        };
      }

      if (activeRole === 'MANAGER') {
        const advice = businessAdvice(state);
        return {
          greeting: `💼 Welcome back Maya! Operations briefing for ${state.name}:`,
          highlights: [
            `📈 Occupancy at ${Math.round((state.rooms.filter((r) => r.status === 'occupied').length / state.rooms.length) * 100)}% (${state.rooms.filter((r) => r.status === 'occupied').length}/${state.rooms.length} rooms occupied)`,
            `⚖️ ${pendingApprovals.length} pending approval: "${pendingApprovals[0]?.title || 'None'}"`,
            `💰 Revenue today: ${state.revenue.currency} ${state.revenue.today} (Week: ${state.revenue.currency} ${state.revenue.week})`,
            `🧰 ${openTasks.length} open staff task(s)`,
            ...(advice ? [advice] : []),
          ],
          actions: ['"Show approvals"', '"Raise Deluxe rates by 10%"', '"Revenue report this week"'],
        };
      }

      // Default to ADMIN briefing
      const advice = businessAdvice(state);
      return {
        greeting: `👑 Executive summary for Dan — ${state.name}:`,
        highlights: [
          `📊 Revenue: ${state.revenue.currency} ${state.revenue.today} today · ${state.revenue.currency} ${state.revenue.week} this week (+9% vs last week)`,
          `🏢 Occupancy: ${state.rooms.filter((r) => r.status === 'occupied').length}/${state.rooms.length} rooms · ${state.arrivals.length} arrivals today`,
          `👥 ${state.team.length} team members active · ${pendingApprovals.length} approval requiring sign-off`,
          ...(advice ? [advice] : []),
        ],
        actions: ['"Morning digest"', '"Show folio for room 101"', '"Revenue report this week"'],
      };
    },
    list_arrivals: async () => ({ arrivals: state.arrivals }),
  };
}
