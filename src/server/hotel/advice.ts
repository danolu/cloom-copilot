import type { HotelState } from '../../shared/types/hotel';

// One data-backed business nudge, computed only from live property numbers —
// never invented. Returns null when nothing stands out, so advice stays
// occasional instead of nagging on every briefing.
export function businessAdvice(state: HotelState): string | null {
  const rooms = state.rooms;
  const occupied = rooms.filter((r) => r.status === 'occupied').length;
  const clean = rooms.filter((r) => r.status === 'clean');
  const occupancyPct = Math.round((occupied / rooms.length) * 100);
  const currency = state.revenue.currency;

  // Unsold inventory tonight is the most actionable signal.
  if (occupancyPct < 75 && clean.length >= 2) {
    const byType = new Map<string, number>();
    for (const r of clean) byType.set(r.type, (byType.get(r.type) || 0) + 1);
    const topType = [...byType.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return `💡 ${clean.length} rooms still unsold tonight at ${occupancyPct}% occupancy (${topType} leads) — a targeted 10% offer on ${topType} could help fill them.`;
  }

  // Revenue trailing yesterday by a real margin.
  if (state.revenue.today < state.revenue.yesterday * 0.85) {
    return `💡 Revenue today (${currency} ${state.revenue.today}) is trailing yesterday (${currency} ${state.revenue.yesterday}) — pushing tonight's remaining inventory or an F&B add-on could close the gap.`;
  }

  // Money parked in open folios.
  const openBalance = Object.values(state.folios)
    .filter((f) => f.status === 'OPEN')
    .reduce((sum, f) => sum + f.balance, 0);
  if (openBalance > 1000) {
    return `💡 ${currency} ${openBalance} is sitting in open folios — settling departures ahead of the checkout rush protects today's revenue.`;
  }

  // Turnover risk: more dirty rooms than clean ones with guests arriving.
  const dirty = rooms.filter((r) => r.status === 'dirty').length;
  if (dirty > clean.length && state.arrivals.length > 0) {
    return `💡 Turnover risk: ${dirty} dirty rooms vs ${clean.length} clean with ${state.arrivals.length} arrivals today — housekeeping sequencing matters more than usual.`;
  }

  return null;
}
