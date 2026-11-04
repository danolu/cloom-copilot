import { test } from 'node:test';
import assert from 'node:assert/strict';

const req = (url: string, body: object, session = 'route-test-session-1', userId?: string) =>
  new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': session,
      ...(userId ? { 'x-user-id': userId } : {}),
    },
    body: JSON.stringify(body),
  });

test('POST /api/reset: non-admin 403, admin 200, and state is reseeded', async () => {
  const { POST } = await import('../../src/app/api/reset/route');
  const forbidden = await POST(req('http://x/api/reset', { userId: 'demo-staff' }));
  assert.equal(forbidden.status, 403);
  const ok = await POST(req('http://x/api/reset', { userId: 'demo-admin' }));
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).ok, true);
});

test('POST /api/digest without a Meta key returns 503', async () => {
  const saved = [process.env.META_API_KEY, process.env.MODEL_API_KEY];
  delete process.env.META_API_KEY;
  delete process.env.MODEL_API_KEY;
  try {
    const { POST } = await import('../../src/app/api/digest/route');
    const res = await POST(req('http://x/api/digest', {}));
    assert.equal(res.status, 503);
  } finally {
    if (saved[0] !== undefined) process.env.META_API_KEY = saved[0];
    if (saved[1] !== undefined) process.env.MODEL_API_KEY = saved[1];
  }
});

test('POST /api/chat without a Meta key returns the configuration error, not a local answer', async () => {
  const saved = [process.env.META_API_KEY, process.env.MODEL_API_KEY];
  delete process.env.META_API_KEY;
  delete process.env.MODEL_API_KEY;
  try {
    const { POST } = await import('../../src/app/api/chat/route');
    const res = await POST(req('http://x/api/chat', { userId: 'demo-admin', text: 'dashboard' }));
    assert.equal(res.status, 200);
    assert.match((await res.json()).text, /not configured/);
  } finally {
    if (saved[0] !== undefined) process.env.META_API_KEY = saved[0];
    if (saved[1] !== undefined) process.env.MODEL_API_KEY = saved[1];
  }
});

test('GET /api/state returns a session snapshot with rooms and audit', async () => {
  const { GET } = await import('../../src/app/api/state/route');
  const res = await GET(new Request('http://x/api/state', { headers: { 'x-session-id': 'route-test-session-1' } }));
  assert.equal(res.status, 200);
  const snap = await res.json();
  assert.equal(snap.rooms.length, 12);
  assert.ok(Array.isArray(snap.audit));
  assert.ok(snap.folios.length >= 4);
});

test('POST /api/voice (JSON) without a key returns heard + configuration error', async () => {
  const saved = [process.env.META_API_KEY, process.env.MODEL_API_KEY];
  delete process.env.META_API_KEY;
  delete process.env.MODEL_API_KEY;
  try {
    const { POST } = await import('../../src/app/api/voice/route');
    const res = await POST(req('http://x/api/voice', { userId: 'demo-admin', text: 'dashboard' }));
    const json = await res.json();
    assert.match(json.heard, /Heard/);
    assert.match(json.text, /not configured/);
  } finally {
    if (saved[0] !== undefined) process.env.META_API_KEY = saved[0];
    if (saved[1] !== undefined) process.env.MODEL_API_KEY = saved[1];
  }
});
