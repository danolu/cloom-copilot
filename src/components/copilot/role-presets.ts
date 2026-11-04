export interface RolePreset {
  name: string;
  title: string;
  initials: string;
  can: string;
  cannot: string;
  chips: string[];
}

export const ROLE_PRESETS: Record<string, RolePreset> = {
  'demo-admin': {
    name: 'Dan',
    title: 'Admin',
    initials: 'D',
    can: 'digest, rates, team, settings, approvals',
    cannot: 'nothing in this demo',
    chips: [
      'Morning digest',
      'Revenue report this week',
      'Show folio for room 101',
      'Add Ama Serwaa to housekeeping',
      'Undo',
    ],
  },
  'demo-superadmin': {
    name: 'Adaeze',
    title: 'Super admin · full access',
    initials: 'A',
    can: 'everything, including team and settings',
    cannot: 'nothing in this demo',
    chips: [
      'Dashboard status',
      'Show team',
      'Add Ama Serwaa to housekeeping',
      'Show settings',
      'Audit departures',
      'Undo',
    ],
  },
  'demo-manager': {
    name: 'Maya',
    title: 'Manager · pricing & approvals',
    initials: 'M',
    can: 'rates, approvals, revenue, reservations',
    cannot: 'team changes, settings',
    chips: ['Show approvals', 'Raise Deluxe rates by 10%', 'List arrivals today', 'Revenue report this week', 'Undo'],
  },
  'demo-staff': {
    name: 'Kofi',
    title: 'Housekeeping · turnovers & tasks',
    initials: 'K',
    can: 'room status, tasks, minibar charges',
    cannot: 'rates, approvals, settling bills',
    chips: [
      'My briefing & tasks',
      'Dirty rooms',
      'Cleaned room 204',
      'Add $25 minibar charge to room 101',
      'Tell maintenance tap is leaking in room 301',
    ],
  },
  'demo-frontdesk': {
    name: 'Sarah',
    title: 'Front desk · check-ins & guests',
    initials: 'S',
    can: 'check-ins, reservations, folios',
    cannot: 'rates, approvals, team changes',
    chips: [
      'List arrivals today',
      'Check in Amara Osei to room 102',
      'Guest request room 301: leaking tap',
      'Check out room 101',
      'Show folio for room 101',
    ],
  },
  'demo-cashier': {
    name: 'Amina',
    title: 'Cashier · billing',
    initials: 'A',
    can: 'folios, charges, settling bills',
    cannot: 'rates, room status, team changes',
    chips: [
      'Show folio for room 101',
      'Settle folio for room 101 with credit card',
      'Charge $85 for dinner to room 301',
      'Add $25 minibar charge to room 101',
      'Bill for room 301',
    ],
  },
  'demo-supervisor': {
    name: 'Kwame',
    title: 'Supervisor · maintenance & rooms',
    initials: 'K',
    can: 'rooms, tasks, check-ins, blocking rooms',
    cannot: 'rates, team changes, settings',
    chips: [
      'All rooms status',
      'Block room 204 for maintenance',
      'Fix leaking tap in 301',
      'List tasks',
      'Audit departures',
    ],
  },
  'demo-accountant': {
    name: 'Efua',
    title: 'Accountant · revenue',
    initials: 'E',
    can: 'revenue, folios, dashboard',
    cannot: 'rates, room status, check-ins',
    chips: ['Revenue report this week', 'Dashboard status', 'Show folio for room 301', 'Audit departures'],
  },
  'demo-restaurant': {
    name: 'Marco',
    title: 'Restaurant · food & drink',
    initials: 'M',
    can: 'food and drink charges to folios',
    cannot: 'rates, room status, approvals',
    chips: ['Charge $85 for dinner to room 301', 'Show folio for room 301', 'Show folio for room 104', 'List tasks'],
  },
};
