import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { createAgent } from '../../src/server/agent/agent';
import { sparkStub } from '../helpers/spark-stub';

const admin = 'demo-admin';
const staff = 'demo-staff'; // Kofi, HOUSEKEEPING

test('all-read batch runs immediately, in order, without confirmation', async () => {
  const agent = createAgent(createHotel(), {
    decide: sparkStub({
      actions: [
        { tool: 'list_arrivals', args: {} },
        { tool: 'get_dashboard', args: {} },
      ],
    }),
  });
  const out = await agent.handle(admin, "today's arrivals and the dashboard", null);
  assert.match(out.text!, /Amara Osei/);
  assert.match(out.text!, /Occupancy/);
  assert.ok(out.text!.indexOf('Amara Osei') < out.text!.indexOf('Occupancy'));
  assert.equal(agent.pending.size, 0);
});

test('batch with writes stages ONE grouped preview; confirm runs every step', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({
      actions: [
        { tool: 'update_room_status', args: { room: '204', status: 'clean' } },
        { tool: 'block_room', args: { room: '205' } },
      ],
    }),
  });
  const ask = await agent.handle(admin, 'clean 204 and block 205', null);
  assert.match(ask.text!, /2 steps/);
  assert.match(ask.text!, /204/);
  assert.match(ask.text!, /205/);
  // Nothing applied yet.
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
  assert.notEqual(hotel.state.rooms.find((r) => r.number === '205')!.status, 'blocked');

  const done = await agent.handle(admin, 'confirm', null);
  assert.match(done.text!, /1\./);
  assert.match(done.text!, /2\./);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'clean');
  assert.equal(hotel.state.rooms.find((r) => r.number === '205')!.status, 'blocked');
  assert.equal(hotel.audit.length, 2);
});

test('cancelling a staged batch changes nothing', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({
      actions: [
        { tool: 'update_room_status', args: { room: '204', status: 'clean' } },
        { tool: 'block_room', args: { room: '205' } },
      ],
    }),
  });
  await agent.handle(admin, 'clean 204 and block 205', null);
  const out = await agent.handle(admin, 'cancel', null);
  assert.match(out.text!, /Cancelled/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
  assert.equal(hotel.audit.length, 0);
});

test('batch is refused whole if any step is outside the role', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({
      actions: [
        { tool: 'update_room_status', args: { room: '204', status: 'clean' } }, // HOUSEKEEPING may do this
        { tool: 'block_room', args: { room: '205' } }, // ...but not this
      ],
    }),
  });
  const out = await agent.handle(staff, 'clean 204 and block 205', null);
  assert.match(out.text!, /can't use/);
  assert.match(out.text!, /Nothing in that batch was run/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
  assert.equal(agent.pending.size, 0);
});

test('batch stops at the first failing step and reports partial progress', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({
      actions: [
        { tool: 'update_room_status', args: { room: '204', status: 'clean' } },
        { tool: 'update_room_status', args: { room: '999', status: 'clean' } },
        { tool: 'block_room', args: { room: '205' } },
      ],
    }),
  });
  await agent.handle(admin, 'clean 204, clean 999, then block 205', null);
  const out = await agent.handle(admin, 'confirm', null);
  assert.match(out.text!, /Room 999 not found/);
  assert.match(out.text!, /later steps were skipped/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'clean');
  assert.notEqual(hotel.state.rooms.find((r) => r.number === '205')!.status, 'blocked');
});

test('batch naming an unknown tool is rejected before anything runs', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({
      actions: [
        { tool: 'update_room_status', args: { room: '204', status: 'clean' } },
        { tool: 'teleport_guest', args: { room: '204' } },
      ],
    }),
  });
  const out = await agent.handle(admin, 'clean 204 and teleport the guest', null);
  assert.match(out.text!, /nothing was changed/);
  assert.equal(hotel.state.rooms.find((r) => r.number === '204')!.status, 'dirty');
  assert.equal(agent.pending.size, 0);
});
