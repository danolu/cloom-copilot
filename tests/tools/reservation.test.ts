import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { businessAdvice } from '../../src/server/hotel/advice';

test('create_reservation prices like Cloom: cost, discount, payable, checkout, reference', async () => {
  const h = createHotel();
  const r: any = await h.tools.create_reservation({
    guest: 'Test Guest',
    checkin: '2027-03-10',
    nights: 2,
    roomType: 'Deluxe King',
    discountPercent: 10,
  });
  assert.ok(r.ok);
  const res = r.reservation;
  // Deluxe King $180 × 2 nights = 360, 10% off = 36, payable 324.
  assert.equal(res.cost, 360);
  assert.equal(res.discount, 36);
  assert.equal(res.payable, 324);
  assert.equal(res.checkin, '2027-03-10');
  assert.equal(res.checkout, '2027-03-12');
  assert.match(res.reference, /^CLOO-202703-\d{6}$/);
  assert.equal(res.status, 'CONFIRMED');
  assert.equal(res.source, 'AGENT');
  assert.ok(h.state.reservations.some((x) => x.id === res.id));
});

test('create_reservation rejects unknown room types and missing guests', async () => {
  const h = createHotel();
  await assert.rejects(() => h.tools.create_reservation({ guest: 'X Y', roomType: 'Igloo Suite' }), /not found/);
  await assert.rejects(() => h.tools.create_reservation({ roomType: 'Twin' }), /Guest name is required/);
  assert.equal(h.state.reservations.length, 4, 'failed creates leave state untouched');
});

test('businessAdvice flags unsold inventory on the seed property', () => {
  const advice = businessAdvice(createHotel().state);
  assert.ok(advice);
  // Seed: 4/12 occupied (33%), 6 clean rooms, Standard King leads with 2.
  assert.match(advice!, /unsold/);
  assert.match(advice!, /Standard King/);
});

test('manager briefing carries the advice line', async () => {
  const h = createHotel();
  const briefing: any = await h.tools.get_role_briefing({ role: 'MANAGER' });
  assert.ok(
    briefing.highlights.some((line: string) => line.includes('💡')),
    'expected a 💡 advice highlight for MANAGER',
  );
});
