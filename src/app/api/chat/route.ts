import { NextResponse } from 'next/server';
import { getSession, sessionIdFrom } from '@/server/instance';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId || body.role || body.phone || 'demo-admin';
    const text = body.text || '';
    const { agent } = getSession(sessionIdFrom(req, body));
    const out = await agent.handle(userId, text, null);
    return NextResponse.json(out);
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
