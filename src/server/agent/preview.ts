import type { HotelInstance } from '../hotel/hotel';

// Human-readable preview for bulk/high-impact writes before confirming.
export function previewTool(tool: string, args: Record<string, any> | undefined, hotel: HotelInstance): string {
  if (tool === 'bulk_update_rates') {
    const roomType = args?.roomType;
    const percent = args?.percent ?? 0;
    const affected = hotel.state.rooms.filter(
      (r) => !roomType || r.type.toLowerCase().includes(String(roomType).toLowerCase()),
    );
    return (
      `*Preview:* ${percent}% on ${affected.length} rooms\n` +
      affected
        .slice(0, 6)
        .map((r) => `• ${r.number} ${r.type}: $${r.rate} → $${Math.round(r.rate * (1 + percent / 100))}`)
        .join('\n') +
      (affected.length > 6 ? `\n…and ${affected.length - 6} more` : '')
    );
  }
  if (tool === 'post_folio_charge') {
    return `*Confirm Charge:* Post $${args?.amount} (${args?.description || 'Incidentals'}) to Room ${args?.room} Folio`;
  }
  if (tool === 'settle_folio') {
    return `*Confirm Settlement:* Settle outstanding balance for Room ${args?.room} via ${args?.paymentMethod || 'Credit Card'}`;
  }
  if (tool === 'check_in') {
    return `*Confirm Check-In:* Guest "${args?.guest}" into Room ${args?.room || 'Clean Available'}`;
  }
  if (tool === 'check_out') {
    return `*Confirm Check-Out:* Room ${args?.room} (will mark room dirty and assign Housekeeping cleaning task)`;
  }
  if (tool === 'update_room_status') {
    return `*Confirm Room Status:* Set Room ${args?.room} to *${args?.status}*`;
  }
  if (tool === 'express_check_in')
    return `*Confirm Express Check-In:* "${args?.guest}" into Room ${args?.room || 'best clean room'} — auto-swap if dirty, folio + keycard${args?.paymentMethod ? `, settle via ${args.paymentMethod}` : ''}`;
  if (tool === 'relocate_room')
    return `*Confirm Relocation:* Move guest Room ${args?.room} → Room ${args?.toRoom} (old room dirty + turnover task)`;
  if (tool === 'triage_guest_request')
    return `*Confirm Triage:* Guest request Room ${args?.room}: "${args?.text}" (may create a routed task)`;
  return `*${tool}* ${JSON.stringify(args || {})}`;
}
