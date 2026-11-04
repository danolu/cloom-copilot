import type { HotelInstance } from '../hotel/hotel';
import { addDaysISO, toISODate, todayISO } from '../hotel/dates';
import { priceReservation } from '../hotel/pricing';

// Guided reservation flow ("slot filling"): when a create_reservation request
// is missing details, the agent holds a draft and asks ONE question at a time
// — guest name, then check-in date, then nights, then room type, then an
// optional discount — before showing a priced summary behind the usual
// confirm gate. Answers are parsed deterministically here; Spark only kicks
// the flow off by returning create_reservation with whatever it heard.

export interface ReservationDraft {
  guestName?: string;
  guestPhone?: string;
  checkin?: string;
  nights?: number;
  roomType?: string;
  adults?: number;
  discountPercent?: number;
  discountAmount?: number;
  discountAsked?: boolean;
}

export type DraftField = 'guestName' | 'checkin' | 'nights' | 'roomType' | 'discount';

export const DRAFT_ORDER: DraftField[] = ['guestName', 'checkin', 'nights', 'roomType', 'discount'];

export function nextDraftField(draft: ReservationDraft): DraftField | null {
  if (!draft.guestName) return 'guestName';
  if (!draft.checkin) return 'checkin';
  if (!draft.nights) return 'nights';
  if (!draft.roomType) return 'roomType';
  if (!draft.discountAsked) return 'discount';
  return null;
}

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};
const MONTH_RE = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*';

// Accepts: 2027-01-15 · tomorrow · today · in 3 days · Jan 15 · 15 Jan (year rolls forward if past).
export function parseDateInput(text: string, now: Date = new Date()): string | null {
  const t = text.trim().toLowerCase();
  const iso = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  if (/\btomorrow\b/.test(t)) return toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  if (/\btoday\b/.test(t)) return toISODate(now);
  const inDays = t.match(/\bin\s+(\d+)\s*days?\b/);
  if (inDays) return toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(inDays[1])));
  const build = (monthName: string, day: number, year?: number): string => {
    const month = MONTHS[monthName.slice(0, 3)];
    let y = year ?? now.getFullYear();
    const candidate = new Date(y, month, day);
    if (!year && candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) y += 1;
    return toISODate(new Date(y, month, day));
  };
  const md = t.match(new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?\\b`));
  if (md) return build(md[1], Number(md[2]), md[3] ? Number(md[3]) : undefined);
  const dm = t.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${MONTH_RE}(?:,?\\s*(\\d{4}))?\\b`));
  if (dm) return build(dm[2], Number(dm[1]), dm[3] ? Number(dm[3]) : undefined);
  return null;
}

export function roomTypeOptions(hotel: HotelInstance): Array<{ type: string; rate: number }> {
  const seen = new Map<string, number>();
  for (const r of hotel.state.rooms) if (!seen.has(r.type)) seen.set(r.type, r.rate);
  return [...seen.entries()].map(([type, rate]) => ({ type, rate }));
}

export function questionFor(field: DraftField, draft: ReservationDraft, hotel: HotelInstance): string {
  switch (field) {
    case 'guestName':
      return "I'd be happy to set that up. What's the guest's name? (Say \"cancel\" anytime to stop.)";
    case 'checkin':
      return `What date is ${draft.guestName} checking in? (e.g. ${addDaysISO(todayISO(), 7)}, "tomorrow", or "Jan 15")`;
    case 'nights':
      return `How many nights will ${draft.guestName} be staying?`;
    case 'roomType':
      return (
        'Which room type? We have:\n' +
        roomTypeOptions(hotel)
          .map((o) => `• ${o.type} — $${o.rate}/night`)
          .join('\n')
      );
    case 'discount':
      return `Almost done. Any discount for ${draft.guestName}? Reply with a percent like "10%", an amount like "$50", or "none".`;
  }
}

export type AnswerResult = { ok: true } | { ok: false; error: string };

// Discounts above this percent need a manager-grade role (checked by caller).
export const DISCOUNT_APPROVAL_THRESHOLD = 20;

export function applyDraftAnswer(
  draft: ReservationDraft,
  field: DraftField,
  raw: string,
  hotel: HotelInstance,
  opts: { canApproveDiscount: boolean },
): AnswerResult {
  const text = raw.trim();
  switch (field) {
    case 'guestName': {
      const name = text.replace(/^(the\s+)?(guest\s+)?name\s+is\s+/i, '').trim();
      if (name.length < 2) return { ok: false, error: "I didn't catch a name — what's the guest's name?" };
      draft.guestName = name;
      return { ok: true };
    }
    case 'checkin': {
      const parsed = parseDateInput(text);
      if (!parsed)
        return {
          ok: false,
          error: `I couldn't read that date. Try something like ${addDaysISO(todayISO(), 7)}, "tomorrow", or "Jan 15".`,
        };
      if (parsed < todayISO())
        return { ok: false, error: `${parsed} is in the past — what date should I use instead?` };
      draft.checkin = parsed;
      return { ok: true };
    }
    case 'nights': {
      const m = text.match(/(\d+)/);
      const n = m ? Number(m[1]) : NaN;
      if (!n || n < 1 || n > 90) return { ok: false, error: 'How many nights? Give me a number between 1 and 90.' };
      draft.nights = n;
      return { ok: true };
    }
    case 'roomType': {
      const options = roomTypeOptions(hotel);
      const lower = text.toLowerCase();
      const match =
        options.find((o) => o.type.toLowerCase() === lower) ||
        options.filter((o) => o.type.toLowerCase().includes(lower) || lower.includes(o.type.toLowerCase()));
      const picked = Array.isArray(match) ? (match.length === 1 ? match[0] : undefined) : match;
      if (!picked)
        return {
          ok: false,
          error: `We don't have that room type. Options:\n${options.map((o) => `• ${o.type} — $${o.rate}/night`).join('\n')}`,
        };
      draft.roomType = picked.type;
      return { ok: true };
    }
    case 'discount': {
      if (/^(none|no|skip|nothing|0)\b/i.test(text)) {
        draft.discountPercent = 0;
        draft.discountAsked = true;
        return { ok: true };
      }
      const pct = text.match(/(\d+(?:\.\d+)?)\s*(%|percent)/i);
      const flat = text.match(/\$\s*(\d+(?:\.\d+)?)/) || text.match(/(\d+(?:\.\d+)?)\s*(dollars|usd)/i);
      const bare = text.match(/^(\d+(?:\.\d+)?)$/);
      if (pct || (bare && Number(bare[1]) <= 100)) {
        const value = Number((pct ?? bare)![1]);
        if (value > 100)
          return { ok: false, error: 'A discount over 100% would make it free and then some — try again, or "none".' };
        if (value > DISCOUNT_APPROVAL_THRESHOLD && !opts.canApproveDiscount)
          return {
            ok: false,
            error: `⛔ Discounts above ${DISCOUNT_APPROVAL_THRESHOLD}% need a manager's approval. You can offer up to ${DISCOUNT_APPROVAL_THRESHOLD}%, or reply "none".`,
          };
        draft.discountPercent = value;
        draft.discountAsked = true;
        return { ok: true };
      }
      if (flat || bare) {
        draft.discountAmount = Number((flat ?? bare)![1]);
        draft.discountAsked = true;
        return { ok: true };
      }
      return { ok: false, error: 'I can take a percent like "10%", an amount like "$50", or "none".' };
    }
  }
}

// Mid-flow corrections: "actually make it 5 nights", "change the date to Jan 20".
export function applyDraftCorrections(
  draft: ReservationDraft,
  raw: string,
  hotel: HotelInstance,
  opts: { canApproveDiscount: boolean },
): boolean {
  if (!/actually|change|instead|update|make it/i.test(raw)) return false;
  let changed = false;
  const date = parseDateInput(raw);
  if (date && date >= todayISO()) {
    draft.checkin = date;
    changed = true;
  }
  const nights = raw.match(/(\d+)\s*nights?/i);
  if (nights) {
    draft.nights = Number(nights[1]);
    changed = true;
  }
  if (/%|percent/i.test(raw)) {
    const r = applyDraftAnswer({ ...draft }, 'discount', raw, hotel, opts);
    if (r.ok) {
      const pct = raw.match(/(\d+(?:\.\d+)?)\s*(%|percent)/i);
      if (pct) {
        draft.discountPercent = Number(pct[1]);
        draft.discountAsked = true;
        changed = true;
      }
    }
  }
  const typeHit = roomTypeOptions(hotel).find((o) => raw.toLowerCase().includes(o.type.toLowerCase()));
  if (typeHit) {
    draft.roomType = typeHit.type;
    changed = true;
  }
  return changed;
}

// Seed a draft from whatever Spark extracted in its create_reservation call.
export function draftFromArgs(args: Record<string, any> | undefined): ReservationDraft {
  const a = args || {};
  const draft: ReservationDraft = {};
  const guest = String(a.guestName || a.guest || '').trim();
  if (guest) draft.guestName = guest;
  if (a.guestPhone || a.phone) draft.guestPhone = String(a.guestPhone || a.phone);
  if (typeof a.checkin === 'string') {
    const parsed = parseDateInput(a.checkin);
    if (parsed && parsed >= todayISO()) draft.checkin = parsed;
  }
  const nights = Number(a.nights);
  if (nights >= 1 && nights <= 90) draft.nights = Math.floor(nights);
  if (typeof a.roomType === 'string' && a.roomType.trim()) draft.roomType = a.roomType.trim();
  const adults = Number(a.adults);
  if (adults >= 1) draft.adults = Math.floor(adults);
  if (a.discountPercent != null) {
    draft.discountPercent = Number(a.discountPercent);
    draft.discountAsked = true;
  } else if (a.discountAmount != null || a.discount != null) {
    draft.discountAmount = Number(a.discountAmount ?? a.discount);
    draft.discountAsked = true;
  }
  return draft;
}

export function draftToArgs(draft: ReservationDraft): Record<string, any> {
  return {
    guest: draft.guestName,
    guestPhone: draft.guestPhone,
    checkin: draft.checkin,
    nights: draft.nights,
    roomType: draft.roomType,
    adults: draft.adults || 1,
    discountPercent: draft.discountPercent,
    discountAmount: draft.discountAmount,
  };
}

// Priced one-liner used when the draft completes (full summary is previewTool).
export function draftPricingLine(draft: ReservationDraft, hotel: HotelInstance): string {
  const p = priceReservation(
    hotel.state.rooms,
    draft.roomType || '',
    draft.nights || 1,
    draft.discountPercent,
    draft.discountAmount,
  );
  return `${p.nights} × $${p.rate} = $${p.cost}${p.discount ? ` − $${p.discount} discount` : ''} → $${p.payable}`;
}
