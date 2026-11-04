import type { HotelContext } from '../context';
import type { HotelTools } from '../tools';
import type { Folio, Task, TaskPriority } from '../../../shared/types/hotel';

// Agentic front-desk flows inspired by Cloom's reservations service:
// 60-second express check-in chaining, guest-request triage, room relocation,
// stay-extension conflict solving, and the departures/folio auditor.
// Multi-step chains execute as ONE confirm-gated write in the agent layer.
export function createFrontdeskTools(
  ctx: HotelContext,
): Pick<
  HotelTools,
  'express_check_in' | 'relocate_room' | 'audit_departures' | 'triage_guest_request' | 'check_extension'
> {
  const { state, log, pushUndo } = ctx;

  return {
    express_check_in: async ({
      guest,
      room,
      paymentMethod,
    }: {
      guest: string;
      room?: string;
      paymentMethod?: string;
    }) => {
      const arrival = state.arrivals.find((a) => a.guest.toLowerCase().includes(guest.toLowerCase()));
      const requested = room ? state.rooms.find((r) => r.number === String(room)) : undefined;
      if (room && !requested) throw new Error(`Room ${room} not found`);

      // Room readiness: use the requested/assigned room if clean, otherwise
      // auto-swap to a clean room of the same type (Cloom's autoSwapIfDirty).
      let target = requested && requested.status === 'clean' ? requested : undefined;
      let swappedFrom: string | undefined;
      if (!target) {
        const preferredType = requested?.type || arrival?.roomType;
        target =
          state.rooms.find((r) => r.status === 'clean' && r.type === preferredType) ||
          state.rooms.find((r) => r.status === 'clean');
        if (requested && target && requested.number !== target.number) swappedFrom = requested.number;
      }
      if (!target) throw new Error('No clean room available for express check-in');

      const prevStatus = target.status;
      target.status = 'occupied';
      const arrivalIndex = state.arrivals.findIndex((a) => a.guest.toLowerCase().includes(guest.toLowerCase()));
      const removedArrival = arrivalIndex >= 0 ? state.arrivals.splice(arrivalIndex, 1)[0] : null;

      let folio: Folio | undefined = state.folios[target.number];
      const folioCreated = !folio;
      if (!folio) {
        folio = {
          room: target.number,
          guest,
          balance: target.rate,
          status: 'OPEN',
          paidAmount: 0,
          items: [
            {
              id: 'CHG-1',
              date: 'Check-in',
              description: `Room Charge (${target.type})`,
              category: 'ROOM',
              amount: target.rate,
              postedBy: 'frontdesk',
            },
          ],
        };
        state.folios[target.number] = folio;
      }

      // Balance settlement step: collect any outstanding balance on the folio.
      let settledAmount = 0;
      if (paymentMethod && folio.balance > 0) {
        settledAmount = folio.balance;
        folio.paidAmount += settledAmount;
        folio.balance = 0;
        folio.status = 'SETTLED';
        folio.paymentMethod = paymentMethod;
        state.revenue.today += settledAmount;
        state.revenue.week += settledAmount;
      }

      const roomNumber = target.number;
      pushUndo({
        label: `express check-in ${guest} into ${roomNumber}`,
        undo: () => {
          target.status = prevStatus;
          if (removedArrival) state.arrivals.push(removedArrival);
          if (folioCreated) delete state.folios[roomNumber];
          if (settledAmount) {
            state.revenue.today -= settledAmount;
            state.revenue.week -= settledAmount;
          }
        },
      });
      log(
        'frontdesk',
        'express_check_in',
        `${guest} -> ${roomNumber}${swappedFrom ? ` (swapped from ${swappedFrom})` : ''}`,
      );
      return {
        ok: true,
        guest,
        room: roomNumber,
        swappedFrom,
        keycardIssued: true,
        settledAmount,
        folioBalance: folio.balance,
        currency: state.revenue.currency,
      };
    },

    relocate_room: async ({ room, toRoom }: { room: string | number; toRoom: string | number }) => {
      const from = state.rooms.find((r) => r.number === String(room));
      const to = state.rooms.find((r) => r.number === String(toRoom));
      if (!from) throw new Error(`Room ${room} not found`);
      if (!to) throw new Error(`Room ${toRoom} not found`);
      if (from.number === to.number) throw new Error('Guest is already in that room');
      if (from.status !== 'occupied') throw new Error(`Room ${from.number} is not occupied`);
      if (to.status !== 'clean') throw new Error(`Room ${to.number} is not available (status: ${to.status})`);

      const folio = state.folios[from.number];
      const guest = folio?.guest || `Guest in ${from.number}`;
      from.status = 'dirty';
      to.status = 'occupied';
      if (folio) {
        delete state.folios[from.number];
        folio.room = to.number;
        state.folios[to.number] = folio;
      }
      const turnoverTask: Task = {
        id: `T-${state.tasks.length + 1}`,
        title: `Turnover clean Room ${from.number} after relocation`,
        assignee: 'Housekeeping',
        priority: 'HIGH',
        done: false,
      };
      state.tasks.push(turnoverTask);

      pushUndo({
        label: `relocate ${guest} from ${from.number} to ${to.number}`,
        undo: () => {
          from.status = 'occupied';
          to.status = 'clean';
          if (folio) {
            delete state.folios[to.number];
            folio.room = from.number;
            state.folios[from.number] = folio;
          }
          state.tasks = state.tasks.filter((t) => t.id !== turnoverTask.id);
        },
      });
      log('frontdesk', 'relocate_room', `${guest}: ${from.number} -> ${to.number}`);
      return { ok: true, guest, fromRoom: from.number, toRoom: to.number, turnoverTaskId: turnoverTask.id };
    },

    audit_departures: async () => {
      const departures = state.rooms
        .filter((r) => r.status === 'occupied')
        .map((r) => {
          const folio = state.folios[r.number];
          const openOrders = (folio?.items || []).filter((i) => i.category === 'F&B');
          return {
            room: r.number,
            guest: folio?.guest || `Guest in ${r.number}`,
            balance: folio?.balance ?? 0,
            openOrders: openOrders.map((i) => `${i.description}: $${i.amount}`),
            readyForCheckout: !folio || folio.balance <= 0,
          };
        });
      log('frontdesk', 'audit_departures', `${departures.length} occupied room(s) audited`);
      return {
        departures,
        blockedCount: departures.filter((d) => !d.readyForCheckout).length,
        currency: state.revenue.currency,
      };
    },

    triage_guest_request: async ({ text, room }: { text: string; room: string | number }) => {
      const r = String(room);
      const t = text.toLowerCase();
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      let department: string;
      let guestReply: string;

      if (/flood|burst|leak|smoke|fire|spark|locked out|power out|blackout|medical|emergency/.test(t)) {
        priority = 'URGENT';
        department = 'Maintenance';
        guestReply = `We have received your urgent request for Room ${r}. Our duty manager and maintenance technician have been alerted and are on their way.`;
      } else if (/a\/?c|air condition|heating|hot water|toilet|noise|loud/.test(t)) {
        priority = 'HIGH';
        department = 'Maintenance';
        guestReply = `We've prioritized your request for Room ${r}. A team member will attend to this promptly.`;
      } else if (/wifi|wi-fi|internet|password/.test(t)) {
        priority = 'LOW';
        department = 'Front Desk';
        guestReply =
          'Please connect to the guest Wi-Fi portal or dial reception (extension 0) for network credentials. Enjoy your stay!';
        log('frontdesk', 'triage_guest_request', `Room ${r}: informational (Wi-Fi)`);
        return { ok: true, priority, department, guestReply, taskId: undefined };
      } else if (/breakfast|food timing|breakfast hour/.test(t)) {
        priority = 'LOW';
        department = 'Front Desk';
        guestReply =
          'Breakfast is served in the restaurant from 07:00 to 10:30 AM daily. Room service is also available.';
        log('frontdesk', 'triage_guest_request', `Room ${r}: informational (breakfast)`);
        return { ok: true, priority, department, guestReply, taskId: undefined };
      } else if (/towel|pillow|blanket|sheet|linen|toiletries|soap|shampoo|trash|clean/.test(t)) {
        priority = 'MEDIUM';
        department = 'Housekeeping';
        guestReply = `Our housekeeping team has received your request for Room ${r} and will deliver items shortly.`;
      } else {
        priority = 'MEDIUM';
        department = 'Front Desk';
        guestReply = `Thank you for reaching out. We have logged your request for Room ${r} and our team will attend to it shortly.`;
      }

      const taskPriority: TaskPriority = priority === 'URGENT' ? 'HIGH' : priority;
      const task: Task = {
        id: `T-${state.tasks.length + 1}`,
        title: `Guest request Room ${r}: ${text}`,
        assignee: department,
        priority: taskPriority,
        done: false,
      };
      state.tasks.push(task);
      pushUndo({
        label: `guest request triage Room ${r}`,
        undo: () => {
          state.tasks = state.tasks.filter((x) => x.id !== task.id);
        },
      });
      log('frontdesk', 'triage_guest_request', `Room ${r}: ${priority}/${department} — ${text}`);
      return { ok: true, priority, department, guestReply, taskId: task.id };
    },

    check_extension: async ({ room, nights }: { room: string | number; nights?: number }) => {
      const r = state.rooms.find((x) => x.number === String(room));
      if (!r) throw new Error(`Room ${room} not found`);
      const folio = state.folios[r.number];
      const guest = folio?.guest || `Guest in ${r.number}`;
      const conflicts = state.reservations.filter(
        (res) => res.roomType === r.type && res.guestName.toLowerCase() !== guest.toLowerCase(),
      );
      const canExtend = conflicts.length === 0;
      const suggestedRoom = canExtend
        ? undefined
        : state.rooms.find((x) => x.status === 'clean' && x.type === r.type && x.number !== r.number)?.number;
      log('frontdesk', 'check_extension', `Room ${r.number}: canExtend=${canExtend}`);
      return {
        ok: true,
        room: r.number,
        guest,
        nights: nights || 1,
        canExtendWithoutConflict: canExtend,
        conflicts: conflicts.map((c) => `${c.reference}: ${c.guestName} (${c.roomType}, ${c.nights}n)`),
        suggestedRelocationRoom: suggestedRoom,
      };
    },
  };
}
