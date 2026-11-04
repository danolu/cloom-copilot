import type { User, UserRole } from '../../shared/types/hotel';

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

// Staff identities and active roles for the copilot interface
export const USERS: Record<string, User> = {
  'demo-admin': { name: 'Dan', role: 'ADMIN' },
  'demo-manager': { name: 'Maya', role: 'MANAGER' },
  'demo-staff': { name: 'Kofi', role: 'HOUSEKEEPING' },
  'demo-frontdesk': { name: 'Sarah', role: 'FRONT_DESK' },
  'demo-supervisor': { name: 'Kwame', role: 'SUPERVISOR' },
  'demo-cashier': { name: 'Amina', role: 'CASHIER' },
  'demo-superadmin': { name: 'Adaeze', role: 'SUPER_ADMIN' },
  'demo-accountant': { name: 'Efua', role: 'ACCOUNTANT' },
  'demo-restaurant': { name: 'Marco', role: 'RESTAURANT_MANAGER' },
  admin: { name: 'Dan', role: 'ADMIN' },
  manager: { name: 'Maya', role: 'MANAGER' },
  housekeeping: { name: 'Kofi', role: 'HOUSEKEEPING' },
  frontdesk: { name: 'Sarah', role: 'FRONT_DESK' },
  supervisor: { name: 'Kwame', role: 'SUPERVISOR' },
  cashier: { name: 'Amina', role: 'CASHIER' },
  superadmin: { name: 'Adaeze', role: 'SUPER_ADMIN' },
  accountant: { name: 'Efua', role: 'ACCOUNTANT' },
  restaurant: { name: 'Marco', role: 'RESTAURANT_MANAGER' },
};
