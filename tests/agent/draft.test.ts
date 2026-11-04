import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { createAgent } from '../../src/server/agent/agent';
import { parseDateInput } from '../../src/server/agent/reservation-draft';
import { sparkStub } from '../helpers/spark-stub';

const owner = 'demo-admin';
const frontDesk = 'demo-frontdesk'; // Sarah, FRONT_DESK

test('parseDateInput: ISO passes through, relative dates resolve', () => {
  assert.equal(parseDateInput('2027-01-15'), '2027-01-15');
  const tomorrow = parseDateInput('tomorrow');
  assert.ok((tomorrow && tomorrow > new Date().toISOString().slice(0, 10)) || tomorrow);
  assert.match(parseDateInput('in 5 days')!, /^\d{4}-\d{2}-\d{2}$/);
  const dec25 = parseDateInput('Dec 25')!;
  assert.match(dec25, /^\d{4}-12-25$/);
  // "Dec 25" always lands in the future (rolls to next year if already past).
  assert.ok(dec25 >= new Date().toISOString().slice(0, 10));
  assert.equal(parseDateInput('next week-ish please'), null);
});

test('guided flow: name → date → nights → room type → discount → summary → confirm', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({ tool: 'create_reservation', args: {} }),
  });

  const ask1 = await agent.handle(owner, 'I want to create a reservation', null);
  assert.match(ask1.text!, /guest's name/i);

  const ask2 = await agent.handle(owner, 'Ada Lovelace', null);
  assert.match(ask2.text!, /checking in/i);

  const ask3 = await agent.handle(owner, '2027-01-15', null);
  assert.match(ask3.text!, /how many nights/i);

  const ask4 = await agent.handle(owner, '3', null);
  assert.match(ask4.text!, /which room type/i);
  assert.match(ask4.text!, /Deluxe King/);

  const ask5 = await agent.handle(owner, 'Deluxe King', null);
  assert.match(ask5.text!, /any discount/i);

  const summary = await agent.handle(owner, '10%', null);
  // 3 nights × $180 = $540, 10% off = −$54, payable $486, checkout 2027-01-18.
  assert.match(summary.text!, /3 × \$180 = \$540/);
  assert.match(summary.text!, /−\$54/);
  assert.match(summary.text!, /Payable: \$486/);
  assert.match(summary.text!, /2027-01-18/);
  assert.equal(hotel.state.reservations.length, 4, 'nothing created before confirm');

  const done = await agent.handle(owner, 'confirm', null);
  assert.match(done.text!, /Ada Lovelace/);
  const res = hotel.state.reservations.find((r) => r.guestName === 'Ada Lovelace')!;
  assert.ok(res, 'reservation created after confirm');
  assert.match(res.reference, /^CLOO-202701-\d{6}$/);
  assert.equal(res.checkin, '2027-01-15');
  assert.equal(res.checkout, '2027-01-18');
  assert.equal(res.cost, 540);
  assert.equal(res.discount, 54);
  assert.equal(res.payable, 486);
  assert.equal(res.status, 'CONFIRMED');
});

test('mid-flow correction: "actually make it 5 nights" updates the draft', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({ tool: 'create_reservation', args: {} }),
  });
  await agent.handle(owner, 'new reservation please', null);
  await agent.handle(owner, 'Ben Carter', null);
  await agent.handle(owner, '2027-03-01', null);
  await agent.handle(owner, '2', null);
  const corrected = await agent.handle(owner, 'actually make it 5 nights', null);
  assert.match(corrected.text!, /Updated/);
  await agent.handle(owner, 'Twin', null);
  const summary = await agent.handle(owner, 'none', null);
  // Twin $120 × 5 = $600, checkout 2027-03-06.
  assert.match(summary.text!, /5 × \$120 = \$600/);
  assert.match(summary.text!, /2027-03-06/);
});

test('upfront-complete details skip straight to the discount question', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({
      tool: 'create_reservation',
      args: { guestName: 'Priya Nair', checkin: '2027-02-01', nights: 2, roomType: 'Twin' },
    }),
  });
  const only = await agent.handle(owner, 'Book Priya Nair into a Twin on 2027-02-01 for 2 nights', null);
  assert.match(only.text!, /any discount/i);
  const summary = await agent.handle(owner, 'none', null);
  assert.match(summary.text!, /Payable: \$240/);
  await agent.handle(owner, 'confirm', null);
  const res = hotel.state.reservations.find((r) => r.guestName === 'Priya Nair')!;
  assert.ok(res);
  assert.equal(res.discount, 0);
  assert.equal(res.payable, 240);
});

test('discount cap: front desk cannot offer above 20%, then "none" completes cleanly', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({ tool: 'create_reservation', args: {} }),
  });
  await agent.handle(frontDesk, 'create a reservation', null);
  await agent.handle(frontDesk, 'Tom Becker', null);
  await agent.handle(frontDesk, '2027-04-10', null);
  await agent.handle(frontDesk, '2', null);
  await agent.handle(frontDesk, 'Standard King', null);
  const refused = await agent.handle(frontDesk, '50%', null);
  assert.match(refused.text!, /above 20% need a manager's approval/);
  // Draft must still be open on the discount question — not silently completed.
  assert.equal(agent.drafts.size, 1);
  const summary = await agent.handle(frontDesk, 'none', null);
  assert.match(summary.text!, /Payable: \$190/);
  await agent.handle(frontDesk, 'confirm', null);
  const res = hotel.state.reservations.find((r) => r.guestName === 'Tom Becker' && r.checkin === '2027-04-10')!;
  assert.ok(res);
  assert.equal(res.discount, 0);
  assert.equal(res.payable, 190);
});

test('cancel mid-draft discards everything', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({ tool: 'create_reservation', args: {} }),
  });
  await agent.handle(owner, 'create a reservation', null);
  await agent.handle(owner, 'Ghost Guest', null);
  assert.equal(agent.drafts.size, 1);
  const out = await agent.handle(owner, 'cancel', null);
  assert.match(out.text!, /discarded/i);
  assert.equal(agent.drafts.size, 0);
  assert.equal(hotel.state.reservations.length, 4);
});
