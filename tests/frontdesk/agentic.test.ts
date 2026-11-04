import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { createAgent } from '../../src/server/agent/agent';
import { sparkStub } from '../helpers/spark-stub';
import type { Decision } from '../../src/shared/types/agent';

const make = (hotel: ReturnType<typeof createHotel>, ...decisions: Decision[]) =>
  createAgent(hotel, { decide: sparkStub(...decisions) });
const frontdesk = 'demo-frontdesk';
const admin = 'demo-admin';

test('express check-in auto-swaps dirty 204 to clean Deluxe 102', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'express_check_in', args: { guest: 'Amara Osei', room: '204' } });
  const ask = await agent.handle(frontdesk, 'Express check-in Amara Osei to room 204', null);
  assert.match(ask.text!, /confirm/i);
  const done = await agent.handle(frontdesk, 'confirm', null);
  assert.match(done.text!, /Express check-in/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '102')!.status, 'occupied');
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
});

test('relocate room moves folio and creates turnover task', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'relocate_room', args: { room: '101', toRoom: '102' } });
  await agent.handle(frontdesk, 'Relocate room 101 to 102', null);
  await agent.handle(frontdesk, 'confirm', null);
  assert.equal(hotel.state.rooms.find((r) => r.number === '101')!.status, 'dirty');
  assert.equal(hotel.state.rooms.find((r) => r.number === '102')!.status, 'occupied');
  assert.equal(hotel.state.folios['102']?.guest, 'Michael Adeyemi');
  assert.ok(hotel.state.tasks.some((t) => /Turnover clean Room 101/.test(t.title)));
});

test('audit departures flags room 101 balance', async () => {
  const agent = make(createHotel(), { tool: 'audit_departures', args: {} });
  const out = await agent.handle(admin, 'Audit departures', null);
  assert.match(out.text!, /Room 101/);
  assert.match(out.text!, /465/);
  assert.match(out.text!, /blocked/);
});

test('triage leaking tap creates HIGH maintenance task', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'triage_guest_request', args: { room: '301', text: 'leaking tap' } });
  await agent.handle(frontdesk, 'Guest request room 301: leaking tap', null);
  await agent.handle(frontdesk, 'confirm', null);
  assert.ok(hotel.state.tasks.some((t) => t.assignee === 'Maintenance' && t.priority === 'HIGH'));
});

test('check_extension reports conflict and suggested room', async () => {
  const hotel = createHotel();
  await hotel.tools.create_reservation({ guest: 'Other Guest', roomType: 'Deluxe King', nights: 1 });
  const r: any = await hotel.tools.check_extension({ room: '101' });
  assert.equal(r.canExtendWithoutConflict, false);
  assert.equal(r.suggestedRelocationRoom, '102');
});

test('without a Meta API key the agent refuses instead of deciding locally', async () => {
  const saved = [process.env.META_API_KEY, process.env.MODEL_API_KEY];
  delete process.env.META_API_KEY;
  delete process.env.MODEL_API_KEY;
  try {
    const agent = createAgent(createHotel());
    const out = await agent.handle(admin, 'dashboard', null);
    assert.match(out.text!, /not configured/);
  } finally {
    if (saved[0] !== undefined) process.env.META_API_KEY = saved[0];
    if (saved[1] !== undefined) process.env.MODEL_API_KEY = saved[1];
  }
});
