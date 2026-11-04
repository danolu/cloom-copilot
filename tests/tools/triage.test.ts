import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';

test('triage: Wi-Fi and breakfast are informational and create NO task', async () => {
  const h = createHotel();
  const before = h.state.tasks.length;
  const wifi: any = await h.tools.triage_guest_request({ room: '101', text: 'what is the wifi password?' });
  assert.equal(wifi.taskId, undefined);
  assert.match(wifi.guestReply, /Wi-Fi/);
  const bf: any = await h.tools.triage_guest_request({ room: '101', text: 'when is breakfast?' });
  assert.equal(bf.taskId, undefined);
  assert.equal(h.state.tasks.length, before);
});

test('triage: urgent leak maps to HIGH task for Maintenance, housekeeping items route to Housekeeping', async () => {
  const h = createHotel();
  const leak: any = await h.tools.triage_guest_request({ room: '301', text: 'water leaking everywhere, flooding' });
  assert.equal(leak.priority, 'URGENT');
  assert.equal(leak.department, 'Maintenance');
  assert.equal(h.state.tasks.find((t) => t.id === leak.taskId)!.priority, 'HIGH');
  const towels: any = await h.tools.triage_guest_request({ room: '202', text: 'need extra towels please' });
  assert.equal(towels.department, 'Housekeeping');
  assert.ok(towels.taskId);
});
