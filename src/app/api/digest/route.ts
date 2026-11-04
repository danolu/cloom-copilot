import { NextResponse } from 'next/server';
import { getSession, sessionIdFrom } from '@/server/instance';
import { digestInsight, metaConfigured } from '@/server/ai/meta-client';

export async function POST(req: Request) {
  if (!metaConfigured())
    return NextResponse.json({ error: 'Meta Model API not configured. Set MODEL_API_KEY.' }, { status: 503 });
  try {
    const { hotel } = getSession(sessionIdFrom(req));
    const d = await hotel.tools.get_dashboard();
    const insight = await digestInsight(d);
    const text = `☀️ *Morning digest — ${d.hotel}*\n${insight}\nOccupancy: ${d.occupancy} · Arrivals: ${d.arrivalsToday} · Revenue today: ${d.currency} ${d.revenueToday}\nOpen tasks: ${d.openTasks} · Pending approvals: ${d.pendingApprovals}`;
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
