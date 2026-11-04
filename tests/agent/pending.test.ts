import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { createAgent } from '../../src/server/agent/agent';
import { sparkStub } from '../helpers/spark-stub';
import type { Decision } from '../../src/shared/types/agent';

const make = (hotel: ReturnType<typeof createHotel>, ...d: Decision[]) =>
  createAgent(hotel, { decide: sparkStub(...d) });
const admin = 'demo-admin';

test('cancel leaves state and audit untouched', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'block_room', args: { room: '204' } });
  await agent.handle(admin, 'block room 204', null);
  const out = await agent.handle(admin, 'cancel', null);
  assert.match(out.text!, /Cancelled/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
  assert.equal(hotel.audit.length, 0);
});

test('a new request replaces a pending write instead of executing it', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'block_room', args: { room: '204' } }, { tool: 'get_dashboard', args: {} });
  await agent.handle(admin, 'block room 204', null);
  const out = await agent.handle(admin, 'dashboard instead', null);
  assert.match(out.text!, /Occupancy/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
  assert.equal(agent.pending.size, 0);
});

test('confirm executes once; a second confirm does not re-run the write', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'block_room', args: { room: '204' } }, { reply: 'Nothing pending.' });
  await agent.handle(admin, 'block room 204', null);
  await agent.handle(admin, 'confirm', null);
  const audits = hotel.audit.length;
  await agent.handle(admin, 'confirm', null);
  assert.equal(hotel.audit.length, audits);
});

test('undo with an empty stack reports nothing to undo', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'undo_last', args: {} });
  await agent.handle(admin, 'undo', null);
  const out = await agent.handle(admin, 'confirm', null);
  assert.match(out.text!, /Nothing to undo/);
});

test('reset clears a pending confirmation (via resetSession)', async () => {
  const { getSession, resetSession } = await import('../../src/server/instance');
  const s = getSession('pending-reset-check');
  s.agent.pending.set('demo-admin', { tool: 'block_room', args: { room: '204' } });
  resetSession('pending-reset-check');
  assert.equal(s.agent.pending.size, 0);
});

test('failed live decision surfaces an error and mutates nothing', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: async () => {
      throw new Error('Meta Model API 500');
    },
  });
  const before = JSON.stringify(hotel.state);
  const out = await agent.handle(admin, 'block room 204', null);
  assert.match(out.text!, /unavailable/);
  assert.equal(JSON.stringify(hotel.state), before);
});
