import type {
  Approval,
  Arrival,
  DashboardResult,
  DocumentAttachment,
  FolioCategory,
  FolioItem,
  Reservation,
  Revenue,
  Room,
  RoomStatus,
  Settings,
  Task,
  TaskPriority,
  TeamMember,
  UserRole,
} from '../../shared/types/hotel';

export interface HotelTools {
  get_dashboard: () => Promise<DashboardResult>;
  get_role_briefing: (args?: {
    role?: UserRole;
  }) => Promise<{ greeting: string; highlights: string[]; actions: string[] }>;
  list_arrivals: () => Promise<{ arrivals: Arrival[] }>;
  list_tasks: () => Promise<{ tasks: Task[] }>;
  list_rooms: () => Promise<{ rooms: Room[] }>;
  list_reservations: () => Promise<{ reservations: Reservation[] }>;
  get_revenue: () => Promise<Revenue>;
  get_revenue_report: () => Promise<{ summary: string; document: DocumentAttachment }>;
  get_folio: (args: { room: string | number }) => Promise<{
    room: string;
    guest: string;
    status: string;
    balance: number;
    paidAmount: number;
    currency: string;
    items: FolioItem[];
  }>;
  post_folio_charge: (args: {
    room: string | number;
    amount: number;
    description: string;
    category?: FolioCategory;
  }) => Promise<{ ok: boolean; room: string; guest: string; item: FolioItem; newBalance: number; currency: string }>;
  settle_folio: (args: { room: string | number; paymentMethod?: string }) => Promise<{
    ok: boolean;
    room: string;
    guest: string;
    settledAmount: number;
    paymentMethod: string;
    receipt: string;
    currency: string;
    message?: string;
  }>;
  list_approvals: () => Promise<{ approvals: Approval[] }>;
  list_team: () => Promise<{ team: TeamMember[] }>;
  get_settings: () => Promise<{ settings: Settings }>;
  block_room: (args: {
    room: string | number;
    reason?: string;
  }) => Promise<{ ok: boolean; room: string; status: RoomStatus }>;
  check_in: (args: {
    guest: string;
    room?: string;
  }) => Promise<{ ok: boolean; guest: string; room: string; status: string }>;
  check_out: (args: {
    room: string;
  }) => Promise<{ ok: boolean; room: string; createdCleaningTask: string; folioBalanceNotice?: string }>;
  update_room_status: (args: {
    room: string | number;
    status: RoomStatus;
  }) => Promise<{ ok: boolean; room: string; prevStatus: RoomStatus; status: RoomStatus }>;
  create_task: (args: {
    title: string;
    assignee?: string;
    priority?: TaskPriority;
  }) => Promise<{ ok: boolean; task: Task }>;
  complete_task: (args: { id: string }) => Promise<{ ok: boolean; task: Task }>;
  decide_approval: (args: { id: string; decision: string }) => Promise<{ ok: boolean; approval: Approval }>;
  create_reservation: (args: {
    guest?: string;
    guestName?: string;
    guestPhone?: string;
    phone?: string;
    checkin?: string;
    nights?: number;
    roomType?: string;
    adults?: number;
    children?: number;
    discountPercent?: number;
    discountAmount?: number;
    discount?: number;
    source?: Reservation['source'];
  }) => Promise<{ ok: boolean; reservation: Reservation }>;
  bulk_update_rates: (args: {
    percent: number;
    roomType?: string;
  }) => Promise<{ ok: boolean; changed: number; percent: number; rooms: string[] }>;
  add_team_member: (args: {
    name: string;
    phone?: string;
    role?: string;
  }) => Promise<{ ok: boolean; member: TeamMember }>;
  remove_team_member: (args: { name: string }) => Promise<{ ok: boolean; removed: TeamMember }>;
  update_setting: (args: {
    key: string;
    value: string | boolean;
  }) => Promise<{ ok: boolean; key: string; value: string | boolean }>;
  undo_last: () => Promise<{ ok: boolean; undone?: string; message?: string }>;
  express_check_in: (args: { guest: string; room?: string; paymentMethod?: string }) => Promise<{
    ok: boolean;
    guest: string;
    room: string;
    swappedFrom?: string;
    keycardIssued: boolean;
    settledAmount: number;
    folioBalance: number;
    currency: string;
  }>;
  relocate_room: (args: {
    room: string | number;
    toRoom: string | number;
  }) => Promise<{ ok: boolean; guest: string; fromRoom: string; toRoom: string; turnoverTaskId: string }>;
  audit_departures: () => Promise<{
    departures: Array<{
      room: string;
      guest: string;
      balance: number;
      openOrders: string[];
      readyForCheckout: boolean;
    }>;
    blockedCount: number;
    currency: string;
  }>;
  triage_guest_request: (args: {
    text: string;
    room: string | number;
  }) => Promise<{ ok: boolean; priority: string; department: string; guestReply: string; taskId?: string }>;
  check_extension: (args: { room: string | number; nights?: number }) => Promise<{
    ok: boolean;
    room: string;
    guest: string;
    nights: number;
    canExtendWithoutConflict: boolean;
    conflicts: string[];
    suggestedRelocationRoom?: string;
  }>;
  [key: string]: (args?: any) => Promise<any>;
}
