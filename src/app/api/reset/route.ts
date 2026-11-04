import { NextResponse } from 'next/server';
import { getSession, resetSession, sessionIdFrom } from '@/server/instance';
import { userOf } from '@/server/agent/agent';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || body.phone || 'demo-admin';
    const user = userOf(userId);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Only ADMIN or SUPER_ADMIN can reset the demo.' }, { status: 403 });
    }
    const sessionId = sessionIdFrom(req, body);
    getSession(sessionId); // ensure it exists before resetting
    resetSession(sessionId);
    return NextResponse.json({ ok: true, text: '♻️ Demo reset — Azure Palms restored to its seeded state.' });
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
