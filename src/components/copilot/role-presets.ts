export interface RolePreset {
  name: string;
  title: string;
  avatar: string;
  chips: string[];
}

export const ROLE_PRESETS: Record<string, RolePreset> = {
  'demo-admin': {
    name: 'Dan',
    title: 'ADMIN (Owner / General Ops)',
    avatar: '👑',
    chips: [
      '☀️ Morning digest (Muse Wonder)',
      '📊 Revenue report this week',
      '🧾 Show folio for room 101',
      '👥 Show team',
      '➕ Add team member Ama Serwaa as HOUSEKEEPING',
      '↩️ Undo',
    ],
  },
  'demo-superadmin': {
    name: 'Adaeze',
    title: 'SUPER_ADMIN (All Access)',
    avatar: '🔑',
    chips: [
      '📈 Dashboard status',
      '👥 Show team',
      '➕ Add team member Ama Serwaa as HOUSEKEEPING',
      '⚙️ Show settings',
      '🔍 Audit departures',
      '↩️ Undo',
    ],
  },
  'demo-manager': {
    name: 'Maya',
    title: 'MANAGER (Pricing & Approvals)',
    avatar: '💼',
    chips: [
      '📈 Dashboard status',
      '⚖️ Show approvals',
      '🏷️ Raise Deluxe rates by 10%',
      '🧳 List arrivals today',
      '📊 Revenue report this week',
      '↩️ Undo',
    ],
  },
  'demo-staff': {
    name: 'Kofi',
    title: 'HOUSEKEEPING (Turnovers & Tasks)',
    avatar: '🧹',
    chips: [
      '🧹 My briefing & tasks',
      '🔴 Dirty rooms',
      '✅ Cleaned room 204',
      '🍫 Add $25 minibar charge to room 101',
      '🔧 Tell maintenance tap is leaking in room 301',
    ],
  },
  'demo-frontdesk': {
    name: 'Sarah',
    title: 'FRONT DESK (Check-in & Guests)',
    avatar: '🛎️',
    chips: [
      '🧳 List arrivals today',
      '🛎️ Check in Amara Osei to room 102',
      '⚡ Express check-in Amara Osei to room 204',
      '🔍 Audit departures',
      '🛎️ Guest request room 301: leaking tap',
      '🚪 Check out room 101',
      '🧾 Show folio for room 101',
      '📅 Current reservations',
    ],
  },
  'demo-cashier': {
    name: 'Amina',
    title: 'CASHIER (Folio & Billing / POS)',
    avatar: '💳',
    chips: [
      '🧾 Show folio for room 101',
      '💳 Settle folio for room 101 with credit card',
      '🍽️ Charge $85 for dinner to room 301',
      '🍫 Add $25 minibar charge to room 101',
      '🧾 Bill for room 301',
    ],
  },
  'demo-supervisor': {
    name: 'Kwame',
    title: 'SUPERVISOR (Maintenance & Rooms)',
    avatar: '🛡️',
    chips: [
      '🏨 All rooms status',
      '🚫 Block room 204 for maintenance',
      '🔧 Fix leaking tap in 301',
      '📋 List tasks',
      '🔀 Relocate room 101 to 102',
      '🔍 Audit departures',
      '🧹 My briefing',
    ],
  },
  'demo-accountant': {
    name: 'Efua',
    title: 'ACCOUNTANT (Revenue & Folios)',
    avatar: '🧮',
    chips: ['📊 Revenue report this week', '📈 Dashboard status', '🧾 Show folio for room 301', '🔍 Audit departures'],
  },
  'demo-restaurant': {
    name: 'Marco',
    title: 'RESTAURANT_MANAGER (F&B)',
    avatar: '🍽️',
    chips: [
      '🍽️ Charge $85 for dinner to room 301',
      '🧾 Show folio for room 301',
      '🧾 Show folio for room 104',
      '📋 List tasks',
    ],
  },
};
