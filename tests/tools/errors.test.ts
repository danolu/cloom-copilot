import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';

test('tools reject unknown rooms, tasks, settings, members', async () => {
  const h = createHotel();
  await assert.rejects(() => h.tools.get_folio({ room: '999' }), /No active folio/);
  await assert.rejects(() => h.tools.update_room_status({ room: '999', status: 'clean' }), /not found/);
  await assert.rejects(() => h.tools.complete_task({ id: 'T-99' }), /not found/);
  await assert.rejects(() => h.tools.update_setting({ key: 'nope', value: 'x' }), /Unknown setting/);
  await assert.rejects(() => h.tools.remove_team_member({ name: 'Nobody' }), /not found/);
  await assert.rejects(() => h.tools.express_check_in({ guest: 'X', room: '999' }), /not found/);
  await assert.rejects(() => h.tools.check_extension({ room: '999' }), /not found/);
});

test('relocate validates source, destination and difference', async () => {
  const h = createHotel();
  await assert.rejects(() => h.tools.relocate_room({ room: '101', toRoom: '101' }), /already in that room/);
  await assert.rejects(() => h.tools.relocate_room({ room: '102', toRoom: '205' }), /not occupied/);
  await assert.rejects(() => h.tools.relocate_room({ room: '101', toRoom: '204' }), /not available/);
  await assert.rejects(() => h.tools.relocate_room({ room: '101', toRoom: '999' }), /not found/);
});

test('express check-in rejects when no clean room exists', async () => {
  const h = createHotel();
  for (const r of h.state.rooms) if (r.status === 'clean') r.status = 'occupied';
  await assert.rejects(() => h.tools.express_check_in({ guest: 'Amara Osei' }), /No clean room/);
});

test('settling an already settled folio is a no-op message', async () => {
  const h = createHotel();
  await h.tools.settle_folio({ room: '202' });
  const again: any = await h.tools.settle_folio({ room: '202' });
  assert.match(again.message, /already settled/);
});

test('check_extension with no same-type reservations can extend (Penthouse 302)', async () => {
  const h = createHotel();
  const r: any = await h.tools.check_extension({ room: '302' });
  assert.equal(r.canExtendWithoutConflict, true);
  assert.deepEqual(r.conflicts, []);
});
