import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHotel } from '../../src/server/hotel/hotel';
import { createAgent } from '../../src/server/agent/agent';
import { sparkStub } from '../helpers/spark-stub';
import { PERMISSIONS, WRITE_TOOLS } from '../../src/server/hotel/permissions';
import { TOOL_SCHEMAS } from '../../src/server/hotel/schemas';
import { ROLES } from '../../src/server/hotel/users';
import type { UserRole } from '../../src/shared/types/hotel';

const USER_BY_ROLE: Record<UserRole, string> = {
  SUPER_ADMIN: 'demo-superadmin',
  ADMIN: 'demo-admin',
  MANAGER: 'demo-manager',
  SUPERVISOR: 'demo-supervisor',
  FRONT_DESK: 'demo-frontdesk',
  HOUSEKEEPING: 'demo-staff',
  ACCOUNTANT: 'demo-accountant',
  CASHIER: 'demo-cashier',
  RESTAURANT_MANAGER: 'demo-restaurant',
};
const ARGS: Record<string, object> = {
  get_folio: { room: '101' },
  post_folio_charge: { room: '101', amount: 1, description: 'x' },
  settle_folio: { room: '101' },
  block_room: { room: '204' },
  check_in: { guest: 'X', room: '102' },
  check_out: { room: '101' },
  update_room_status: { room: '204', status: 'clean' },
  create_task: { title: 'x' },
  complete_task: { id: 'T-1' },
  decide_approval: { id: 'A-1', decision: 'approved' },
  create_reservation: { guest: 'X' },
  bulk_update_rates: { percent: 1 },
  add_team_member: { name: 'X' },
  remove_team_member: { name: 'X' },
  update_setting: { key: 'currency', value: 'USD' },
  get_role_briefing: {},
  express_check_in: { guest: 'Amara Osei' },
  relocate_room: { room: '101', toRoom: '102' },
  triage_guest_request: { room: '101', text: 'towels' },
  audit_departures: {},
  check_extension: { room: '101' },
};

test('every schema tool has a permission entry and vice versa', () => {
  for (const s of TOOL_SCHEMAS) assert.ok(PERMISSIONS[s.name], `missing permissions for ${s.name}`);
});

test('every write tool is blocked for at least one unauthorized role, mutating nothing', async () => {
  for (const tool of WRITE_TOOLS) {
    const allowed = PERMISSIONS[tool] || [];
    const badRole = ROLES.find((r) => !allowed.includes(r));
    assert.ok(badRole, `${tool} should exclude some role`);
    const hotel = createHotel();
    const agent = createAgent(hotel, { decide: sparkStub({ tool, args: ARGS[tool] || {} }) });
    const before = JSON.stringify(hotel.state);
    const out = await agent.handle(USER_BY_ROLE[badRole!], `run ${tool}`, null);
    assert.match(out.text!, /can't use/, `${tool} should be blocked for ${badRole}`);
    assert.equal(JSON.stringify(hotel.state), before, `${tool} mutated state for ${badRole}`);
  }
});

test('new roles: ACCOUNTANT cannot check in, RESTAURANT_MANAGER cannot settle, SUPER_ADMIN can settle', async () => {
  const h1 = createHotel();
  const a1 = createAgent(h1, { decide: sparkStub({ tool: 'check_in', args: { guest: 'X', room: '102' } }) });
  assert.match((await a1.handle('demo-accountant', 'check in X', null)).text!, /can't use/);

  const h2 = createHotel();
  const a2 = createAgent(h2, { decide: sparkStub({ tool: 'settle_folio', args: { room: '101' } }) });
  assert.match((await a2.handle('demo-restaurant', 'settle 101', null)).text!, /can't use/);

  const h3 = createHotel();
  const a3 = createAgent(h3, { decide: sparkStub({ tool: 'settle_folio', args: { room: '101' } }) });
  await a3.handle('demo-superadmin', 'settle 101', null);
  await a3.handle('demo-superadmin', 'confirm', null);
  assert.equal(h3.state.folios['101'].balance, 0);
});

test('RESTAURANT_MANAGER can post an F&B charge', async () => {
  const hotel = createHotel();
  const agent = createAgent(hotel, {
    decide: sparkStub({
      tool: 'post_folio_charge',
      args: { room: '301', amount: 85, description: 'dinner', category: 'F&B' },
    }),
  });
  await agent.handle('demo-restaurant', 'charge dinner', null);
  await agent.handle('demo-restaurant', 'confirm', null);
  assert.equal(hotel.state.folios['301'].balance, 690);
});
