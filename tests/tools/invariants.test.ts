import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';

test('seed invariants: every occupied room has a folio whose items sum to its balance', () => {
  const h = createHotel();
  for (const r of h.state.rooms.filter((x) => x.status === 'occupied')) {
    const f = h.state.folios[r.number];
    assert.ok(f, `occupied room ${r.number} needs a folio`);
    assert.equal(
      f.items.reduce((s, i) => s + i.amount, 0),
      f.balance,
      `folio ${r.number} items must sum to balance`,
    );
  }
});

test('dashboard occupancy matches room states after express check-in', async () => {
  const h = createHotel();
  await h.tools.express_check_in({ guest: 'Liam Chen', room: '205' });
  const d = await h.tools.get_dashboard();
  const occupied = h.state.rooms.filter((r) => r.status === 'occupied').length;
  assert.equal(d.occupancy, `${occupied}/${h.state.rooms.length} rooms`);
});

test('express check-in with payment settles the new folio and adds to revenue', async () => {
  const h = createHotel();
  const before = h.state.revenue.today;
  const r: any = await h.tools.express_check_in({ guest: 'Liam Chen', room: '205', paymentMethod: 'card' });
  assert.ok(r.settledAmount > 0);
  assert.equal(r.folioBalance, 0);
  assert.equal(h.state.revenue.today, before + r.settledAmount);
});
