import type { HotelContext } from '../context';
import type { HotelTools } from '../tools';

export function createRevenueTools(
  ctx: HotelContext,
): Pick<HotelTools, 'get_revenue' | 'get_revenue_report' | 'bulk_update_rates'> {
  const { state, log, pushUndo } = ctx;
  return {
    get_revenue: async () => ({ ...state.revenue }),
    get_revenue_report: async () => {
      const rows: [string, number | string][] = [
        ['date', 'revenue'],
        ['Mon', 3800],
        ['Tue', 4100],
        ['Wed', 3950],
        ['Thu', 4420],
        ['Fri', 5100],
        ['Sat', 4380],
        ['Sun', 3190],
      ];
      return {
        summary: `Week revenue ${state.revenue.currency} ${state.revenue.week} vs ${state.revenue.currency} ${state.revenue.lastWeek} last week (+${Math.round(((state.revenue.week - state.revenue.lastWeek) / state.revenue.lastWeek) * 100)}%). Best day: Friday.`,
        document: {
          filename: 'revenue-report.csv',
          mime: 'text/csv',
          content: rows.map((r) => r.join(',')).join('\n'),
        },
      };
    },

    bulk_update_rates: async ({ percent, roomType }: { percent: number; roomType?: string }) => {
      const affected = state.rooms.filter(
        (r) => !roomType || r.type.toLowerCase().includes(String(roomType).toLowerCase()),
      );
      if (!affected.length) throw new Error('No rooms matched');
      const prev = affected.map((r) => ({ r, rate: r.rate, weekendRate: r.weekendRate }));
      for (const r of affected) {
        r.rate = Math.round(r.rate * (1 + percent / 100));
        r.weekendRate = Math.round(r.weekendRate * (1 + percent / 100));
      }
      pushUndo({
        label: `bulk rate change (${affected.length} rooms)`,
        undo: () =>
          prev.forEach(({ r, rate, weekendRate }) => {
            r.rate = rate;
            r.weekendRate = weekendRate;
          }),
      });
      log('admin', 'bulk_update_rates', `${percent}% on ${affected.length} rooms`);
      return { ok: true, changed: affected.length, percent, rooms: affected.map((r) => r.number) };
    },
  };
}
