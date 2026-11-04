import type { HotelContext } from '../context';
import type { HotelTools } from '../tools';
import type { Reservation, RoomStatus, Task } from '../../../shared/types/hotel';
import { addDaysISO, todayISO } from '../dates';
import { priceReservation } from '../pricing';

export function createRoomTools(
  ctx: HotelContext,
): Pick<
  HotelTools,
  | 'list_rooms'
  | 'list_reservations'
  | 'check_in'
  | 'check_out'
  | 'update_room_status'
  | 'block_room'
  | 'create_reservation'
> {
  const { state, log, pushUndo } = ctx;
  return {
    list_rooms: async () => ({ rooms: state.rooms }),
    list_reservations: async () => ({ reservations: state.reservations }),
    check_in: async ({ guest, room }: { guest: string; room?: string }) => {
      const targetRoom = room
        ? state.rooms.find((r) => r.number === String(room))
        : state.rooms.find((r) => r.status === 'clean') || state.rooms[0];
      if (!targetRoom) throw new Error('No available room found');
      const prevStatus = targetRoom.status;
      targetRoom.status = 'occupied';
      const arrivalIndex = state.arrivals.findIndex((a) => a.guest.toLowerCase().includes(guest.toLowerCase()));
      const removedArrival = arrivalIndex >= 0 ? state.arrivals.splice(arrivalIndex, 1)[0] : null;

      // Initialize folio for guest if not existing
      if (!state.folios[targetRoom.number]) {
        state.folios[targetRoom.number] = {
          room: targetRoom.number,
          guest,
          balance: targetRoom.rate,
          status: 'OPEN',
          paidAmount: 0,
          items: [
            {
              id: 'CHG-1',
              date: 'Check-in',
              description: `Room Charge (${targetRoom.type})`,
              category: 'ROOM',
              amount: targetRoom.rate,
              postedBy: 'frontdesk',
            },
          ],
        };
      }

      pushUndo({
        label: `check-in ${guest} into ${targetRoom.number}`,
        undo: () => {
          targetRoom.status = prevStatus;
          if (removedArrival) state.arrivals.push(removedArrival);
        },
      });
      log('frontdesk', 'check_in', `${guest} -> ${targetRoom.number}`);
      return { ok: true, guest, room: targetRoom.number, status: 'checked_in' };
    },
    check_out: async ({ room }: { room: string }) => {
      const r = state.rooms.find((x) => x.number === String(room));
      if (!r) throw new Error(`Room ${room} not found`);
      const prev = r.status;
      r.status = 'dirty';
      const cleanTask: Task = {
        id: `T-${state.tasks.length + 1}`,
        title: `Clean and turnover Room ${r.number} post-checkout`,
        assignee: 'Housekeeping',
        priority: 'HIGH',
        done: false,
      };
      state.tasks.push(cleanTask);

      const folio = state.folios[r.number];
      const folioNotice =
        folio && folio.balance > 0
          ? `⚠️ Room ${r.number} has an UNPAID folio balance of $${folio.balance} ($${folio.items.map((i) => `${i.description}: $${i.amount}`).join(', ')}). Please settle with guest!`
          : undefined;

      pushUndo({
        label: `checkout room ${room}`,
        undo: () => {
          r.status = prev;
          state.tasks = state.tasks.filter((t) => t.id !== cleanTask.id);
        },
      });
      log('frontdesk', 'check_out', room);
      return { ok: true, room: r.number, createdCleaningTask: cleanTask.id, folioBalanceNotice: folioNotice };
    },
    update_room_status: async ({ room, status }: { room: string | number; status: RoomStatus }) => {
      const r = state.rooms.find((x) => x.number === String(room));
      if (!r) throw new Error(`Room ${room} not found`);
      const prevStatus = r.status;
      r.status = status;
      pushUndo({
        label: `mark room ${room} ${status}`,
        undo: () => {
          r.status = prevStatus;
        },
      });
      log('staff', 'update_room_status', `${room}: ${prevStatus} -> ${status}`);
      return { ok: true, room: r.number, prevStatus, status: r.status };
    },
    block_room: async ({ room, reason }: { room: string | number; reason?: string }) => {
      const r = state.rooms.find((x) => x.number === String(room));
      if (!r) throw new Error(`Room ${room} not found`);
      const prev = r.status;
      r.status = 'blocked';
      pushUndo({
        label: `block room ${room}`,
        undo: () => {
          r.status = prev;
        },
      });
      log('admin', 'block_room', `${room}: ${reason || 'blocked'}`);
      return { ok: true, room: r.number, status: r.status };
    },
    create_reservation: async (args: {
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
    }) => {
      const guestName = String(args.guestName || args.guest || '').trim();
      if (!guestName) throw new Error('Guest name is required for a reservation');
      const checkin = args.checkin || todayISO();
      const pricing = priceReservation(
        state.rooms,
        args.roomType || state.rooms[0].type,
        args.nights || 1,
        args.discountPercent,
        args.discountAmount ?? args.discount,
      );
      // Cloom reference format: CLOO-YYYYMM-000001 (sequence per property).
      const seq =
        state.reservations.reduce((max, r) => {
          const n = parseInt((r.reference || '').split('-').pop() || '0', 10);
          return Number.isNaN(n) ? max : Math.max(max, n);
        }, 0) + 1;
      const reference = `CLOO-${checkin.slice(0, 4)}${checkin.slice(5, 7)}-${String(seq).padStart(6, '0')}`;
      const res: Reservation = {
        id: reference,
        reference,
        source: args.source || 'AGENT',
        guestName,
        guestPhone: args.guestPhone || args.phone,
        checkin,
        checkout: addDaysISO(checkin, pricing.nights),
        nights: pricing.nights,
        adults: args.adults || 1,
        children: args.children || 0,
        roomType: pricing.roomType,
        cost: pricing.cost,
        discount: pricing.discount,
        payable: pricing.payable,
        status: 'CONFIRMED',
      };
      state.reservations.push(res);
      pushUndo({
        label: `reservation ${res.reference}`,
        undo: () => {
          state.reservations = state.reservations.filter((x) => x.id !== res.id);
        },
      });
      log('admin', 'create_reservation', `${guestName} ${res.reference}`);
      return { ok: true, reservation: res };
    },
  };
}
