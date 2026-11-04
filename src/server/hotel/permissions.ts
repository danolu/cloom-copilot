import type { UserRole } from '../../shared/types/hotel';

// Mirrors Cloom's real system roles (UserRole). There is no OWNER role:
// property admins are ADMIN / SUPER_ADMIN, and access is permission-driven.
export const ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'SUPERVISOR',
  'FRONT_DESK',
  'HOUSEKEEPING',
  'ACCOUNTANT',
  'CASHIER',
  'RESTAURANT_MANAGER',
];

const HMS: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK', 'HOUSEKEEPING'];

// tool -> roles allowed, mirroring Cloom's seeded ROLE_PERMISSIONS.
export const PERMISSIONS: Record<string, UserRole[]> = {
  get_dashboard: [...HMS, 'ACCOUNTANT'],
  get_role_briefing: [...ROLES],
  list_arrivals: HMS,
  list_tasks: HMS,
  list_rooms: HMS,
  get_revenue: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'],
  get_revenue_report: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'],
  list_reservations: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
  create_reservation: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
  check_in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
  check_out: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
  update_room_status: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK', 'HOUSEKEEPING'],
  get_folio: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FRONT_DESK', 'ACCOUNTANT', 'CASHIER'],
  post_folio_charge: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FRONT_DESK', 'CASHIER', 'RESTAURANT_MANAGER', 'HOUSEKEEPING'],
  settle_folio: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FRONT_DESK', 'CASHIER'],
  list_approvals: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  decide_approval: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  block_room: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR'],
  create_task: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
  complete_task: [...HMS],
  bulk_update_rates: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  list_team: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  add_team_member: ['SUPER_ADMIN', 'ADMIN'],
  remove_team_member: ['SUPER_ADMIN', 'ADMIN'],
  get_settings: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  update_setting: ['SUPER_ADMIN', 'ADMIN'],
  undo_last: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  express_check_in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
  relocate_room: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
  audit_departures: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK', 'CASHIER', 'ACCOUNTANT'],
  triage_guest_request: HMS,
  check_extension: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'FRONT_DESK'],
};

export const WRITE_TOOLS: ReadonlySet<string> = new Set([
  'block_room',
  'check_in',
  'check_out',
  'update_room_status',
  'post_folio_charge',
  'settle_folio',
  'create_task',
  'complete_task',
  'decide_approval',
  'create_reservation',
  'bulk_update_rates',
  'add_team_member',
  'remove_team_member',
  'update_setting',
  'undo_last',
  'express_check_in',
  'relocate_room',
  'triage_guest_request',
]);
