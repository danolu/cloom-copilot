import { NextResponse } from 'next/server';
import { getSession, sessionIdFrom } from '@/server/instance';

// Read-only snapshot for the judges' mini dashboard: live property state +
// recent changes (audit trail) for the caller's session.
export async function GET(req: Request) {
  const { hotel } = getSession(sessionIdFrom(req));
  const s = hotel.state;
  const occupied = s.rooms.filter((r) => r.status === 'occupied');
  return NextResponse.json({
    hotel: s.name,
    occupancy: `${occupied.length}/${s.rooms.length}`,
    revenueToday: s.revenue.today,
    currency: s.revenue.currency,
    openTasks: s.tasks.filter((t) => !t.done).length,
    pendingApprovals: s.approvals.filter((a) => a.status === 'pending').length,
    blockedDepartures: occupied.filter((r) => (s.folios[r.number]?.balance ?? 0) > 0).length,
    rooms: s.rooms,
    arrivals: s.arrivals,
    tasks: s.tasks.filter((t) => !t.done),
    approvals: s.approvals.filter((a) => a.status === 'pending'),
    folios: Object.values(s.folios).map((f) => ({
      room: f.room,
      guest: f.guest,
      balance: f.balance,
      status: f.status,
    })),
    audit: [...hotel.audit].slice(-20).reverse(),
  });
}
