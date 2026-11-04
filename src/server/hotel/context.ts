import type { AuditEntry, HotelState } from '../../shared/types/hotel';

export interface UndoItem {
  label: string;
  undo: () => void;
}

export interface HotelContext {
  state: HotelState;
  audit: AuditEntry[];
  log: (actor: string, action: string, detail: string) => void;
  pushUndo: (item: UndoItem) => void;
  popUndo: () => UndoItem | undefined;
}
