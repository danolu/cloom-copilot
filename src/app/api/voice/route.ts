import { NextResponse } from 'next/server';
import { getSession, sessionIdFrom } from '@/server/instance';
import { transcribeVoice } from '@/server/ai/transcribe';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const userId =
      url.searchParams.get('userId') ||
      url.searchParams.get('role') ||
      url.searchParams.get('phone') ||
      req.headers.get('x-user-id') ||
      req.headers.get('x-phone') ||
      'demo-admin';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { agent } = getSession(sessionIdFrom(req, body));
      const text = body.text || '';
      const caller = body.userId || body.role || body.phone || userId;
      const out = await agent.handle(caller, text, null);
      return NextResponse.json({ heard: `🎙️ Heard: "${text}"`, ...out });
    }

    // Audio upload
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const transcript = await transcribeVoice(buffer);
    if (!transcript) {
      return NextResponse.json({ error: 'Could not transcribe voice audio.' }, { status: 400 });
    }
    const { agent } = getSession(sessionIdFrom(req));
    const out = await agent.handle(userId, transcript, null);
    return NextResponse.json({ heard: `🎙️ Heard: "${transcript}"`, ...out });
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
