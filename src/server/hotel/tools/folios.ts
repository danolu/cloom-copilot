import type { HotelContext } from '../context';
import type { HotelTools } from '../tools';
import type { FolioCategory, FolioItem } from '../../../shared/types/hotel';

export function createFolioTools(
  ctx: HotelContext,
): Pick<HotelTools, 'get_folio' | 'post_folio_charge' | 'settle_folio'> {
  const { state, log, pushUndo } = ctx;
  return {
    get_folio: async ({ room }: { room: string | number }) => {
      const r = String(room);
      const folio = state.folios[r];
      if (!folio) throw new Error(`No active folio found for Room ${r}`);
      return {
        room: r,
        guest: folio.guest,
        status: folio.status,
        balance: folio.balance,
        paidAmount: folio.paidAmount,
        currency: state.revenue.currency,
        items: folio.items,
      };
    },
    post_folio_charge: async ({
      room,
      amount,
      description,
      category,
    }: {
      room: string | number;
      amount: number;
      description: string;
      category?: FolioCategory;
    }) => {
      const r = String(room);
      let folio = state.folios[r];
      if (!folio) {
        const roomObj = state.rooms.find((x) => x.number === r);
        const guestName = roomObj?.status === 'occupied' ? `Guest in ${r}` : 'Guest';
        folio = { room: r, guest: guestName, items: [], balance: 0, status: 'OPEN', paidAmount: 0 };
        state.folios[r] = folio;
      }
      const item: FolioItem = {
        id: `CHG-${folio.items.length + 1}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description,
        category:
          category ||
          (/minibar/i.test(description)
            ? 'MINIBAR'
            : /restaurant|dinner|breakfast|food|f&b/i.test(description)
              ? 'F&B'
              : 'OTHER'),
        amount: Number(amount),
        postedBy: 'staff',
      };
      folio.items.push(item);
      folio.balance += item.amount;

      pushUndo({
        label: `charge $${amount} to Room ${r} (${description})`,
        undo: () => {
          folio.items = folio.items.filter((i) => i.id !== item.id);
          folio.balance -= item.amount;
        },
      });
      log('staff', 'post_folio_charge', `Room ${r}: $${amount} - ${description}`);
      return {
        ok: true,
        room: r,
        guest: folio.guest,
        item,
        newBalance: folio.balance,
        currency: state.revenue.currency,
      };
    },
    settle_folio: async ({ room, paymentMethod }: { room: string | number; paymentMethod?: string }) => {
      const r = String(room);
      const folio = state.folios[r];
      if (!folio) throw new Error(`No active folio for Room ${r}`);
      if (folio.balance <= 0) {
        return {
          ok: true,
          room: r,
          guest: folio.guest,
          settledAmount: 0,
          paymentMethod: folio.paymentMethod || 'NONE',
          receipt: 'N/A',
          currency: state.revenue.currency,
          message: `Folio for Room ${r} already settled ($0.00 balance).`,
        };
      }
      const settling = folio.balance;
      const method = paymentMethod || 'CREDIT_CARD';
      folio.paidAmount += settling;
      folio.balance = 0;
      folio.status = 'SETTLED';
      folio.paymentMethod = method;
      state.revenue.today += settling;
      state.revenue.week += settling;

      pushUndo({
        label: `settle folio Room ${r} ($${settling})`,
        undo: () => {
          folio.balance = settling;
          folio.paidAmount -= settling;
          folio.status = 'OPEN';
          state.revenue.today -= settling;
          state.revenue.week -= settling;
        },
      });
      log('cashier', 'settle_folio', `Room ${r}: settled $${settling} via ${method}`);
      return {
        ok: true,
        room: r,
        guest: folio.guest,
        settledAmount: settling,
        paymentMethod: method,
        receipt: `REC-${Date.now().toString().slice(-6)}`,
        currency: state.revenue.currency,
      };
    },
  };
}
