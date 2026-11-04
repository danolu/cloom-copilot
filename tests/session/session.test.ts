import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { getSession, resetSession } from '../../src/server/instance';

test('sessions are isolated: mutating one does not affect another', async () => {
  const a = getSession('judge-session-a');
  const b = getSession('judge-session-b');
  await a.hotel.tools.update_room_status({ room: '102', status: 'dirty' });
  assert.equal(a.hotel.state.rooms.find((r) => r.number === '102')!.status, 'dirty');
  assert.equal(b.hotel.state.rooms.find((r) => r.number === '102')!.status, 'clean');
});

test('reset restores seeded state and clears audit/pending', async () => {
  const s = getSession('judge-session-reset');
  await s.hotel.tools.update_room_status({ room: '102', status: 'dirty' });
  assert.ok(s.hotel.audit.length > 0);
  resetSession('judge-session-reset');
  assert.equal(s.hotel.state.rooms.find((r) => r.number === '102')!.status, 'clean');
  assert.equal(s.hotel.state.rooms.length, 12);
  assert.equal(s.hotel.state.folios['101']?.guest, 'Michael Adeyemi');
  assert.equal(s.hotel.state.folios['301']?.guest, 'Isabella Romano');
  assert.equal(s.agent.pending.size, 0);
});

test('hotel.reset reseeds in place so existing tools see fresh state', async () => {
  const hotel = createHotel();
  await hotel.tools.block_room({ room: '201' });
  assert.equal(hotel.state.rooms.find((r) => r.number === '201')!.status, 'blocked');
  hotel.reset();
  assert.equal(hotel.state.rooms.find((r) => r.number === '201')!.status, 'clean');
});

test('settling a folio adds to revenue today and week (and undo reverts)', async () => {
  const hotel = createHotel();
  const before = hotel.state.revenue.today;
  const r: any = await hotel.tools.settle_folio({ room: '202', paymentMethod: 'card' });
  assert.equal(hotel.state.revenue.today, before + r.settledAmount);
  await hotel.tools.undo_last();
  assert.equal(hotel.state.revenue.today, before);
});
