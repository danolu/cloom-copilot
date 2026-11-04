export interface RolePreset {
  name: string;
  title: string;
  initials: string;
  chips: string[];
}

export const ROLE_PRESETS: Record<string, RolePreset> = {
  'demo-admin': {
    name: 'Dan',
    title: 'Owner',
    initials: 'D',
    chips: [
      'Morning digest',
      'Revenue report this week',
      'Show folio for room 101',
      'Show team',
      'Add Ama Serwaa to housekeeping',
      'Undo',
    ],
  },
  'demo-superadmin': {
    name: 'Adaeze',
    title: 'Owner · full access',
    initials: 'A',
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
    chips: [
      'Dashboard status',
      'Show approvals',
      'Raise Deluxe rates by 10%',
      'List arrivals today',
      'Revenue report this week',
      'Undo',
    ],
  },
  'demo-staff': {
    name: 'Kofi',
    title: 'Housekeeping · turnovers & tasks',
    initials: 'K',
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
    chips: [
      'List arrivals today',
      'Check in Amara Osei to room 102',
      'Express check-in Amara Osei to room 204',
      'Audit departures',
      'Guest request room 301: leaking tap',
      'Check out room 101',
      'Show folio for room 101',
      'Current reservations',
    ],
  },
  'demo-cashier': {
    name: 'Amina',
    title: 'Cashier · billing',
    initials: 'A',
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
    chips: [
      'All rooms status',
      'Block room 204 for maintenance',
      'Fix leaking tap in 301',
      'List tasks',
      'Relocate room 101 to 102',
      'Audit departures',
      'My briefing',
    ],
  },
  'demo-accountant': {
    name: 'Efua',
    title: 'Accountant · revenue',
    initials: 'E',
    chips: ['Revenue report this week', 'Dashboard status', 'Show folio for room 301', 'Audit departures'],
  },
  'demo-restaurant': {
    name: 'Marco',
    title: 'Restaurant · food & drink',
    initials: 'M',
    chips: ['Charge $85 for dinner to room 301', 'Show folio for room 301', 'Show folio for room 104', 'List tasks'],
  },
};
