import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { createAgent } from '../../src/server/agent/agent';
import { sparkStub } from '../helpers/spark-stub';
import type { Decision } from '../../src/shared/types/agent';

const make = (hotel: ReturnType<typeof createHotel>, ...decisions: Decision[]) =>
  createAgent(hotel, { decide: sparkStub(...decisions) });
const owner = 'demo-admin';
const manager = 'demo-manager';
const staff = 'demo-staff';

test('unrecognized staff member gets access prompt', async () => {
  const agent = make(createHotel());
  const out = await agent.handle('unknown-staff-id', 'dashboard', null);
  assert.ok(out.text);
  assert.match(out.text, /not recognized/);
  assert.doesNotMatch(out.text, /Occupancy/);
});

test('read tools answer without confirmation', async () => {
  const agent = make(createHotel(), { tool: 'list_arrivals', args: {} });
  const out = await agent.handle(owner, "today's arrivals", null);
  assert.ok(out.text);
  assert.match(out.text, /Amara Osei/);
});

test('write tools are confirm-gated, then execute once', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'block_room', args: { room: '204' } });
  const ask = await agent.handle(owner, 'block room 204 for maintenance', null);
  assert.ok(ask.text);
  assert.match(ask.text, /confirm/i);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
  const done = await agent.handle(owner, 'confirm', null);
  assert.ok(done.text);
  assert.match(done.text, /blocked/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'blocked');
  assert.equal(hotel.audit.length, 1);
});

test('role gate: HOUSEKEEPING cannot block rooms or touch revenue', async () => {
  const hotel = createHotel();
  const agent = make(hotel, { tool: 'block_room', args: { room: '204' } }, { tool: 'get_revenue_report', args: {} });
  const blockAttempt = await agent.handle(staff, 'block room 204', null);
  assert.ok(blockAttempt.text);
  assert.match(blockAttempt.text, /can't use/);
  const revenueAttempt = await agent.handle(staff, 'revenue report this week', null);
  assert.ok(revenueAttempt.text);
  assert.match(revenueAttempt.text, /can't use/);
  assert.equal(hotel.audit.length, 0);
});

test('role gate: MANAGER can do bulk rates but cannot add team members', async () => {
  const hotel = createHotel();
  const agent = make(
    hotel,
    { tool: 'bulk_update_rates', args: { percent: 10, roomType: 'Deluxe King' } },
    { tool: 'add_team_member', args: { name: 'Joe', role: 'FRONT_DESK' } },
  );
  await agent.handle(manager, 'raise Deluxe rates by 10%', null);
  const applied = await agent.handle(manager, 'confirm', null);
  assert.ok(applied.text);
  assert.match(applied.text, /applied to 3 rooms/);
  const addAttempt = await agent.handle(manager, 'add team member Joe as FRONTDESK', null);
  assert.ok(addAttempt.text);
  assert.match(addAttempt.text, /can't use/);
});

test('bulk rates preview, apply, and undo restores original rates', async () => {
  const hotel = createHotel();
  const agent = make(
    hotel,
    { tool: 'bulk_update_rates', args: { percent: 10, roomType: 'Deluxe King' } },
    { tool: 'undo_last', args: {} },
  );
  const before = hotel.state.rooms.find((r) => r.number === '101')!.rate;
  const ask = await agent.handle(owner, 'raise Deluxe rates by 10%', null);
  assert.ok(ask.text);
  assert.match(ask.text, /Preview:/);
  await agent.handle(owner, 'confirm', null);
  assert.equal(hotel.state.rooms.find((r) => r.number === '101')!.rate, Math.round(before * 1.1));
  await agent.handle(owner, 'undo', null);
  await agent.handle(owner, 'confirm', null);
  assert.equal(hotel.state.rooms.find((r) => r.number === '101')!.rate, before);
});

test('owner can add a team member and change settings', async () => {
  const hotel = createHotel();
  const agent = make(
    hotel,
    { tool: 'add_team_member', args: { name: 'Ama Serwaa', role: 'HOUSEKEEPING' } },
    { tool: 'update_setting', args: { key: 'checkInTime', value: '15:00' } },
  );
  await agent.handle(owner, 'add team member Ama Serwaa as HOUSEKEEPING', null);
  await agent.handle(owner, 'confirm', null);
  assert.ok(hotel.state.team.some((m) => m.name === 'Ama Serwaa' && m.role === 'HOUSEKEEPING'));
  await agent.handle(owner, 'set check-in time to 15:00', null);
  await agent.handle(owner, 'confirm', null);
  assert.equal(hotel.state.settings.checkInTime, '15:00');
});

test('revenue report returns a CSV document', async () => {
  const agent = make(createHotel(), { tool: 'get_revenue_report', args: {} });
  const out = await agent.handle(owner, 'revenue report this week', null);
  assert.ok(out.document);
  assert.equal(out.document.filename, 'revenue-report.csv');
  assert.match(out.document.content, /date,revenue/);
});

test('the same agent serves in-app copilot and voice queries', async () => {
  const agent = make(createHotel(), { tool: 'get_settings', args: {} });
  const viaCopilot = await agent.handle(owner, 'show settings', null);
  assert.ok(viaCopilot.text);
  assert.match(viaCopilot.text, /Check-in time/);
});

test('duplicate message id is ignored (idempotency)', async () => {
  const agent = make(createHotel(), { tool: 'get_dashboard', args: {} });
  const first = await agent.handle(owner, 'dashboard', 'msg.1');
  const dup = await agent.handle(owner, 'dashboard', 'msg.1');
  assert.ok(first.text);
  assert.equal(dup.duplicate, true);
});

test('housekeeping can update room status but cannot check in guest', async () => {
  const hotel = createHotel();
  const agent = make(
    hotel,
    { tool: 'update_room_status', args: { room: '204', status: 'clean' } },
    { tool: 'check_in', args: { guest: 'Amara Osei', room: '102' } },
  );
  await agent.handle(staff, 'cleaned room 204', null);
  await agent.handle(staff, 'confirm', null);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'clean');

  const checkInAttempt = await agent.handle(staff, 'check in Amara Osei to 102', null);
  assert.match(checkInAttempt.text!, /can't use/);
});

test('front desk can check in and check out guest', async () => {
  const hotel = createHotel();
  const agent = make(
    hotel,
    { tool: 'check_in', args: { guest: 'Amara Osei', room: '102' } },
    { tool: 'check_out', args: { room: '101' } },
  );
  const frontdesk = 'demo-frontdesk';

  await agent.handle(frontdesk, 'check in Amara Osei to 102', null);
  await agent.handle(frontdesk, 'confirm', null);
  assert.equal(hotel.state.rooms.find((r) => r.number === '102')!.status, 'occupied');

  await agent.handle(frontdesk, 'check out room 101', null);
  await agent.handle(frontdesk, 'confirm', null);
  assert.equal(hotel.state.rooms.find((r) => r.number === '101')!.status, 'dirty');
  assert.ok(hotel.state.tasks.some((t) => t.title.includes('Room 101')));
});

test('role briefing tailors highlights to current staff role', async () => {
  const agent = make(createHotel(), { tool: 'get_role_briefing', args: {} }, { tool: 'get_role_briefing', args: {} });
  const hkBriefing = await agent.handle(staff, 'briefing', null);
  assert.match(hkBriefing.text!, /Kofi/);
  assert.match(hkBriefing.text!, /dirty room/);

  const adminBriefing = await agent.handle(owner, 'briefing', null);
  assert.match(adminBriefing.text!, /Dan/);
  assert.match(adminBriefing.text!, /Revenue/);
});

test('housekeeping can post minibar charge to room folio and undo', async () => {
  const hotel = createHotel();
  const agent = make(
    hotel,
    { tool: 'post_folio_charge', args: { room: '101', amount: 25, description: 'minibar' } },
    { tool: 'undo_last', args: {} },
  );
  const initialBalance = hotel.state.folios['101'].balance;

  const ask = await agent.handle(staff, 'add $25 minibar charge to room 101', null);
  assert.match(ask.text!, /Confirm Charge/);
  await agent.handle(staff, 'confirm', null);
  assert.equal(hotel.state.folios['101'].balance, initialBalance + 25);

  // Manager or Admin undos the last charge
  await agent.handle(manager, 'undo', null);
  await agent.handle(manager, 'confirm', null);
  assert.equal(hotel.state.folios['101'].balance, initialBalance);
});

test('front desk can view folio, checkout warns of balance, and cashier can settle', async () => {
  const hotel = createHotel();
  const agent = make(
    hotel,
    { tool: 'get_folio', args: { room: '101' } },
    { tool: 'settle_folio', args: { room: '101', paymentMethod: 'credit card' } },
  );
  const frontdesk = 'demo-frontdesk';
  const cashier = 'demo-cashier';

  // View folio
  const folioView = await agent.handle(frontdesk, 'show folio for room 101', null);
  assert.match(folioView.text!, /Guest Folio — Room 101/);
  assert.match(folioView.text!, /Michael Adeyemi/);

  // Settle bill
  await agent.handle(cashier, 'settle folio for room 101 with credit card', null);
  await agent.handle(cashier, 'confirm', null);
  assert.equal(hotel.state.folios['101'].balance, 0);
  assert.equal(hotel.state.folios['101'].status, 'SETTLED');
});
