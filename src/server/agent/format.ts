const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2027-01-15" -> "15 Jan 2027" — how people say dates out loud.
const humanDate = (iso: string): string => {
  const [y, m, d] = String(iso || '')
    .split('-')
    .map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
};

const RESERVATION_STATUS: Record<string, string> = {
  CONFIRMED: 'confirmed',
  AWAITING_CHECKIN: 'due in today',
  PENDING: 'pending',
  CHECKED_IN: 'checked in',
  CHECKED_OUT: 'checked out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

export const formatToolResult = (name: string, r: any): string => {
  if (name === 'get_dashboard')
    return `📊 *${r.hotel}* right now\n${r.occupancy} occupied · ${r.arrivalsToday} arriving today · ${r.openTasks} open tasks · ${r.pendingApprovals} approvals waiting · ${r.currency} ${r.revenueToday} taken today`;
  if (name === 'get_role_briefing')
    return `${r.greeting}\n\n${r.highlights.join('\n')}\n\n💡 *Try asking:*\n${r.actions.map((a: string) => `• ${a}`).join('\n')}`;
  if (name === 'list_arrivals')
    return (
      '*Arrivals today*\n' +
      r.arrivals.map((a: any) => `• ${a.guest} — ${a.roomType}, ETA ${a.eta}${a.vip ? ' ⭐ VIP' : ''}`).join('\n')
    );
  if (name === 'list_tasks')
    return r.tasks.length
      ? '*Open tasks*\n' +
          r.tasks
            .map((t: any) => `• ${t.id} ${t.title} (${t.assignee})${t.priority === 'HIGH' ? ' — high priority' : ''}`)
            .join('\n')
      : 'No open tasks. 🎉';
  if (name === 'list_rooms') {
    // Answer like a person: the count first, then one line per group —
    // never a 12-row inventory dump.
    const groups: Array<[string, string]> = [
      ['occupied', 'Occupied'],
      ['clean', 'Ready'],
      ['dirty', 'Needs cleaning'],
      ['blocked', 'Blocked'],
    ];
    const inGroup = (s: string) => r.rooms.filter((x: any) => x.status === s);
    const present = groups.filter(([s]) => inGroup(s).length > 0);
    const countLine = present.map(([s, label]) => `${inGroup(s).length} ${label.toLowerCase()}`).join(' · ');
    const lines = present.map(
      ([s, label]) =>
        `• ${label}: ` +
        inGroup(s)
          .map((x: any) => `${x.number} ${x.type} $${x.rate}`)
          .join(', '),
    );
    return `*Rooms — ${r.rooms.length} total*\n${countLine}\n${lines.join('\n')}`;
  }
  if (name === 'list_reservations')
    return (
      '*Reservations*\n' +
      r.reservations
        .map(
          (x: any) =>
            `• ${x.guestName} — ${x.roomType}, ${humanDate(x.checkin)} → ${humanDate(x.checkout)} · ${x.nights} night${x.nights > 1 ? 's' : ''} · $${x.payable}${x.discount ? ` (saved $${x.discount})` : ''} · ${RESERVATION_STATUS[x.status] || String(x.status).toLowerCase()} · ref ${x.reference}`,
        )
        .join('\n')
    );
  if (name === 'get_revenue')
    return `*Revenue*\nToday: ${r.currency} ${r.today}\nYesterday: ${r.currency} ${r.yesterday}\nThis week: ${r.currency} ${r.week} (last week ${r.currency} ${r.lastWeek})`;
  if (name === 'get_revenue_report') return `📊 *Revenue report*\n${r.summary}\n📎 ${r.document.filename} attached.`;
  if (name === 'get_folio') {
    const items = (r.items || [])
      .map((i: any) => `• [${i.category}] ${i.description}: $${i.amount} (${i.date})`)
      .join('\n');
    return `🧾 *Guest Folio — Room ${r.room} (${r.guest})*\nStatus: ${r.status === 'OPEN' ? 'Open' : 'Settled'}\n\n${items || 'No charges posted yet.'}\n\n*Outstanding Balance:* ${r.currency} ${r.balance} (Paid: ${r.currency} ${r.paidAmount})`;
  }
  if (name === 'post_folio_charge')
    return `✅ Posted $${r.item.amount} (${r.item.description}) to Room ${r.room} folio. New Balance: ${r.currency} ${r.newBalance}. (Reply "undo" to revert)`;
  if (name === 'settle_folio') {
    if (r.message) return r.message;
    return `💳 *Folio Settled — Room ${r.room} (${r.guest})*\nAmount: ${r.currency} ${r.settledAmount} via ${r.paymentMethod}\nReceipt: ${r.receipt}\nRemaining Balance: $0.00. (Reply "undo" to revert)`;
  }
  if (name === 'list_approvals')
    return r.approvals.length
      ? '*Pending approvals*\n' +
          r.approvals
            .map((a: any) => `• ${a.id}: ${a.title} — ${a.requestedBy}\nReply "approve" or "reject".`)
            .join('\n')
      : 'No pending approvals.';
  if (name === 'list_team')
    return '*Team*\n' + r.team.map((m: any) => `• ${m.name} — ${m.role} (${m.phone})`).join('\n');
  if (name === 'get_settings') {
    const SETTING_LABELS: Record<string, string> = {
      checkInTime: 'Check-in time',
      checkOutTime: 'Check-out time',
      currency: 'Currency',
      digestTime: 'Morning digest at',
      autoAssignHousekeeping: 'Housekeeping auto-assigned',
    };
    return (
      '*Settings*\n' +
      Object.entries(r.settings)
        .map(([k, v]) => `• ${SETTING_LABELS[k] || k}: ${typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}`)
        .join('\n')
    );
  }
  if (name === 'check_in')
    return `✅ Checked in ${r.guest} into Room ${r.room}. Key card ready. (Reply "undo" to revert)`;
  if (name === 'check_out') {
    let msg = `✅ Checked out Room ${r.room}. Room marked dirty and turnover task ${r.createdCleaningTask} created for Housekeeping. (Reply "undo" to revert)`;
    if (r.folioBalanceNotice) msg += `\n\n${r.folioBalanceNotice}`;
    return msg;
  }
  if (name === 'update_room_status')
    return `✅ Room ${r.room} is now *${r.status}* (was ${r.prevStatus}). (Reply "undo" to revert)`;
  if (name === 'block_room') return `✅ Room ${r.room} is now blocked. (Reply "undo" to revert)`;
  if (name === 'create_task') return `✅ Task created: ${r.task.title} → ${r.task.assignee}`;
  if (name === 'complete_task') return `✅ ${r.task.id} done: ${r.task.title}`;
  if (name === 'decide_approval') return `✅ ${r.approval.id} ${r.approval.status}: ${r.approval.title}`;
  if (name === 'create_reservation')
    return `✅ Booked! ${r.reservation.guestName} — ${r.reservation.roomType}, ${humanDate(r.reservation.checkin)} → ${humanDate(r.reservation.checkout)} (${r.reservation.nights} night${r.reservation.nights > 1 ? 's' : ''}), $${r.reservation.payable}${r.reservation.discount ? ` (saved $${r.reservation.discount})` : ''}. Ref ${r.reservation.reference}.`;
  if (name === 'bulk_update_rates')
    return `✅ Rates ${r.percent > 0 ? '+' : ''}${r.percent}% applied to ${r.changed} rooms (${r.rooms.join(', ')}). Reply "undo" to revert.`;
  if (name === 'add_team_member')
    return `✅ Added ${r.member.name} as ${r.member.role}. They can now link with their phone number.`;
  if (name === 'remove_team_member') return `✅ Removed ${r.removed.name} (${r.removed.role}).`;
  if (name === 'update_setting') return `✅ Setting updated: ${r.key} = ${r.value}`;
  if (name === 'express_check_in')
    return `⚡ *Express check-in complete* — ${r.guest} into Room ${r.room}${r.swappedFrom ? ` (auto-swapped from dirty Room ${r.swappedFrom})` : ''}. 🔑 Keycard issued.${r.settledAmount ? ` Settled ${r.currency} ${r.settledAmount}.` : ''} Folio balance: ${r.currency} ${r.folioBalance}. (Reply "undo" to revert)`;
  if (name === 'relocate_room')
    return `🔀 Relocated ${r.guest}: Room ${r.fromRoom} → Room ${r.toRoom}. Old room dirty, turnover task ${r.turnoverTaskId} created. (Reply "undo" to revert)`;
  if (name === 'audit_departures')
    return (
      '*Departures audit*\n' +
      r.departures
        .map(
          (d: any) =>
            `• Room ${d.room} ${d.guest} — balance ${r.currency} ${d.balance}${d.openOrders.length ? `, open: ${d.openOrders.join('; ')}` : ''} — ${d.readyForCheckout ? '✅ ready' : '⛔ blocked'}`,
        )
        .join('\n') +
      `\n${r.blockedCount} blocked checkout(s).`
    );
  if (name === 'triage_guest_request')
    return `🛎️ *Guest request triaged* [${r.priority}] → ${r.department}${r.taskId ? ` (task ${r.taskId})` : ' (informational, no task)'}\nGuest reply: ${r.guestReply}`;
  if (name === 'check_extension')
    return r.canExtendWithoutConflict
      ? `✅ Room ${r.room} (${r.guest}) can extend ${r.nights} night(s) — no conflicts.`
      : `⚠️ Extension for Room ${r.room} (${r.guest}) conflicts: ${r.conflicts.join('; ')}.${r.suggestedRelocationRoom ? ` Suggested relocation: Room ${r.suggestedRelocationRoom}.` : ''}`;
  if (name === 'undo_last') return r.ok ? `↩️ Undone: ${r.undone}` : r.message || 'Nothing to undo.';
  return JSON.stringify(r);
};
