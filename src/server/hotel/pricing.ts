import type { Room } from '../../shared/types/hotel';

export interface ReservationPricing {
  roomType: string;
  rate: number;
  nights: number;
  cost: number;
  discount: number;
  payable: number;
}

// Single source of truth for reservation money math, mirroring Cloom's
// Prisma Reservation fields: cost = rate x nights, payable = cost - discount.
// Used by the create_reservation tool AND the agent's preview/draft summary,
// so the number a guest is quoted is always the number that gets stored.
export function priceReservation(
  rooms: Room[],
  roomType: string,
  nights: number,
  discountPercent?: number,
  discountAmount?: number,
): ReservationPricing {
  const wanted = (roomType || '').toLowerCase();
  const room =
    rooms.find((r) => r.type.toLowerCase() === wanted) || rooms.find((r) => r.type.toLowerCase().includes(wanted));
  if (!room || !wanted) throw new Error(`Room type "${roomType}" not found`);
  const n = Math.max(1, Math.floor(nights || 1));
  const cost = room.rate * n;
  const rawDiscount = discountAmount != null ? discountAmount : Math.round((cost * (discountPercent || 0)) / 100);
  const discount = Math.min(Math.max(0, rawDiscount), cost);
  return { roomType: room.type, rate: room.rate, nights: n, cost, discount, payable: cost - discount };
}
