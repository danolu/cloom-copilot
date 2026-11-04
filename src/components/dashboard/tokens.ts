// Dashboard colors in one place. Components use names, not hex values.

export interface RoomStatusMeta {
  label: string;
  color: string;
}

export const ROOM_STATUS_META: Record<string, RoomStatusMeta> = {
  occupied: { label: 'occupied', color: '#2563eb' },
  clean: { label: 'clean', color: '#059669' },
  dirty: { label: 'dirty', color: '#dc2626' },
  blocked: { label: 'blocked', color: '#7c3aed' },
  inspected: { label: 'inspected', color: '#0891b2' },
};

export function roomStatusMeta(status: string): RoomStatusMeta {
  return ROOM_STATUS_META[status] ?? { label: status, color: '#64748b' };
}

export type StatTone = 'blue' | 'green' | 'amber' | 'violet' | 'red' | 'cyan';

export const STAT_TONES: Record<StatTone, { background: string; color: string }> = {
  blue: { background: '#eff6ff', color: '#2563eb' },
  green: { background: '#ecfdf5', color: '#059669' },
  amber: { background: '#fffbeb', color: '#d97706' },
  violet: { background: '#f5f3ff', color: '#7c3aed' },
  red: { background: '#fef2f2', color: '#dc2626' },
  cyan: { background: '#ecfeff', color: '#0891b2' },
};
