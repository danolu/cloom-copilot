export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'SUPERVISOR'
  | 'FRONT_DESK'
  | 'HOUSEKEEPING'
  | 'ACCOUNTANT'
  | 'CASHIER'
  | 'RESTAURANT_MANAGER';

export interface User {
  name: string;
  role: UserRole;
  phone?: string;
}

export type RoomStatus = 'occupied' | 'clean' | 'dirty' | 'blocked';

export interface Room {
  number: string;
  type: string;
  status: RoomStatus;
  rate: number;
  weekendRate: number;
}

export interface Arrival {
  guest: string;
  roomType: string;
  eta: string;
  vip: boolean;
}

export type ReservationStatus =
  | 'COURTESY_HOLD'
  | 'PENDING'
  | 'CONFIRMED'
  | 'AWAITING_CHECKIN'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export type ReservationSource = 'WALK_IN' | 'OTA' | 'PHONE' | 'WEBSITE' | 'CORPORATE' | 'AGENT';

// Mirrors Cloom's Prisma `Reservation` model (see prisma/schema.prisma):
// checkin/checkout are dates, money is integer cost/discount/payable,
// and `reference` is the human booking code (CLOO-YYYYMM-000001).
export interface Reservation {
  id: string;
  reference: string;
  source: ReservationSource;
  guestName: string;
  guestPhone?: string;
  checkin: string; // ISO date, yyyy-mm-dd
  checkout: string; // ISO date, yyyy-mm-dd
  nights: number; // derived: checkout - checkin
  adults: number;
  children: number;
  roomType: string;
  cost: number;
  discount: number;
  payable: number;
  status: ReservationStatus;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  done: boolean;
}

export interface TeamMember {
  name: string;
  phone: string;
  role: UserRole;
}

export interface Approval {
  id: string;
  title: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected' | string;
}

export interface Settings {
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  digestTime: string;
  autoAssignHousekeeping: boolean;
  [key: string]: string | boolean;
}

export interface Revenue {
  today: number;
  yesterday: number;
  week: number;
  lastWeek: number;
  currency: string;
}

export type FolioCategory = 'ROOM' | 'MINIBAR' | 'F&B' | 'LAUNDRY' | 'SPA' | 'OTHER';

export interface FolioItem {
  id: string;
  date: string;
  description: string;
  category: FolioCategory;
  amount: number;
  postedBy: string;
}

export interface Folio {
  room: string;
  guest: string;
  items: FolioItem[];
  balance: number;
  status: 'OPEN' | 'SETTLED';
  paidAmount: number;
  paymentMethod?: string;
}

export interface HotelState {
  name: string;
  settings: Settings;
  rooms: Room[];
  arrivals: Arrival[];
  reservations: Reservation[];
  tasks: Task[];
  team: TeamMember[];
  approvals: Approval[];
  revenue: Revenue;
  folios: Record<string, Folio>;
}

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface DocumentAttachment {
  filename: string;
  mime: string;
  content: string;
}

export interface DashboardResult {
  hotel: string;
  occupancy: string;
  arrivalsToday: number;
  openTasks: number;
  pendingApprovals: number;
  revenueToday: number;
  currency: string;
}
