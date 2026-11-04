import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { formatToolResult } from '../../src/server/agent/format';

// Replies should read like a colleague talking, not a system dumping rows.
test('list_rooms leads with the count and groups rooms on one line each', async () => {
  const h = createHotel();
  const text = formatToolResult('list_rooms', await h.tools.list_rooms());
  const lines = text.split('\n');
  assert.match(lines[0], /12 total/);
  assert.match(lines[1], /4 occupied/);
  assert.match(lines[1], /6 ready/);
  assert.ok(lines.length <= 6, `expected a compact summary, got ${lines.length} lines:\n${text}`);
  assert.match(text, /Occupied: 101 Deluxe King \$180/);
});

test('dashboard reads as one natural sentence', async () => {
  const h = createHotel();
  const text = formatToolResult('get_dashboard', await h.tools.get_dashboard());
  assert.match(text, /4\/12 rooms occupied/);
  assert.match(text, /arriving today/);
  assert.doesNotMatch(text, /Occupancy:/);
});

test('reservation replies use human dates and no status-code jargon', async () => {
  const h = createHotel();
  const r: any = await h.tools.create_reservation({
    guest: 'Ada Lovelace',
    checkin: '2027-01-15',
    nights: 3,
    roomType: 'Deluxe King',
    discountPercent: 10,
  });
  const created = formatToolResult('create_reservation', r);
  assert.match(created, /15 Jan 2027/);
  assert.match(created, /saved \$54/);
  assert.doesNotMatch(created, /\[CONFIRMED\]/);
  const listed = formatToolResult('list_reservations', await h.tools.list_reservations());
  assert.match(listed, /Ada Lovelace/);
  assert.match(listed, /confirmed/);
  assert.doesNotMatch(listed, /\[(CONFIRMED|AWAITING_CHECKIN|PENDING)\]/);
});
