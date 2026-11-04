import type { ToolSchema } from '../../shared/types/agent';

export const TOOL_SCHEMAS: ToolSchema[] = Object.entries({
  get_dashboard:
    'Property counts and totals: occupancy, arrivals, tasks, approvals, revenue today — use for "how many…" questions',
  get_role_briefing:
    'Personalized briefing for the current user — use whenever they ask for a briefing, morning update, their summary, or what to focus on {role}',
  list_arrivals: "Today's arriving guests",
  list_tasks: 'Open tasks',
  list_rooms: 'Full room list with status and rates — only when they ask to see or list the rooms',
  get_revenue: 'Revenue summary',
  get_revenue_report: 'Full revenue report with CSV document',
  get_folio: 'View guest folio / itemized bill for a room {room}',
  post_folio_charge:
    'Post a charge (minibar, F&B, laundry) to a room folio (WRITE) {room, amount, description, category}',
  settle_folio: 'Settle and pay a guest folio at checkout (WRITE) {room, paymentMethod}',
  list_reservations: 'Current reservations',
  create_reservation:
    'Create a reservation (WRITE) {guest, guestPhone, checkin (YYYY-MM-DD), nights, roomType, adults, discountPercent}. Omit details you do not know — the copilot asks follow-up questions for missing ones.',
  check_in: 'Check in a guest to a room (WRITE) {guest, room}',
  check_out: 'Check out a guest, marks room dirty and generates cleaning task (WRITE) {room}',
  update_room_status: 'Update room status to clean, dirty, or inspected (WRITE) {room, status}',
  list_approvals: 'Pending approvals',
  decide_approval: 'Approve/reject (WRITE) {id, decision}',
  block_room: 'Block a room (WRITE) {room, reason}',
  create_task: 'Create staff task (WRITE) {title, assignee, priority}',
  complete_task: 'Mark task done (WRITE) {id}',
  bulk_update_rates: 'Change rates by percent, optionally per room type (WRITE) {percent, roomType}',
  list_team: 'Team members and roles',
  add_team_member: 'Add team member (WRITE) {name, phone, role}',
  remove_team_member: 'Remove team member (WRITE) {name}',
  get_settings: 'Property settings',
  update_setting: 'Change a setting (WRITE) {key, value}',
  undo_last: 'Undo the last write (WRITE)',
  express_check_in:
    '60-second express check-in: auto-swap dirty room to clean same-type room, create folio, settle if payment given, issue keycard (WRITE) {guest, room, paymentMethod}',
  relocate_room: 'Move occupied guest to a clean room, old room dirty + turnover task (WRITE) {room, toRoom}',
  audit_departures: 'Audit occupied rooms for checkout readiness: balances and open F&B orders',
  triage_guest_request:
    'Triage a guest request by urgency/department, creates task unless informational Wi-Fi/breakfast (WRITE) {text, room}',
  check_extension: 'Check if stay extension conflicts with reservations of same room type {room, nights}',
}).map(([name, description]) => ({ name, description }));
