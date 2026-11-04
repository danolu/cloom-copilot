// Live Spark chip matrix: sends suggestion-chip phrases (as a judge would tap)
// to /api/chat for each role in its own session, confirms writes, and reports
// whether the response looks like the intended flow vs a role block / error.
// Usage: BASE_URL=http://127.0.0.1:3000 node scripts/live-chip-matrix.mjs [roleId ...]
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const CASES = {
  'demo-admin': ['Revenue report this week', 'Show folio for room 101', 'Show team'],
  'demo-manager': ['Dashboard status', 'Show approvals', 'Raise Deluxe rates by 10%'],
  'demo-staff': ['Cleaned room 204', 'Add $25 minibar charge to room 101'],
  'demo-frontdesk': [
    'Express check-in Amara Osei to room 204',
    'Audit departures',
    'Guest request room 301: leaking tap',
  ],
  'demo-cashier': ['Settle folio for room 101 with credit card'],
  'demo-supervisor': ['Block room 204 for maintenance', 'Relocate room 101 to 102'],
  'demo-superadmin': ['Show settings', 'Audit departures'],
  'demo-accountant': ['Revenue report this week', 'Audit departures'],
  'demo-restaurant': ['Charge $85 for dinner to room 301'],
};
const roles = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CASES);
let pass = 0,
  total = 0;
for (const role of roles) {
  const session = `live-matrix-${role}-${Date.now()}`;
  for (const text of CASES[role] || []) {
    total++;
    const post = async (t) =>
      await (
        await fetch(`${BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session-id': session },
          body: JSON.stringify({ userId: role, text: t, sessionId: session }),
        })
      ).json();
    let out = await post(text);
    if (out.buttons) out = await post('confirm');
    const bad = !out.text || /can't use|not configured|unavailable|⚠️/i.test(out.text);
    console.log(
      `${bad ? 'FAIL' : 'PASS'} ${role}: "${text}" -> ${(out.text || out.error || '').split('\n')[0].slice(0, 110)}`,
    );
    if (!bad) pass++;
  }
}
console.log(`Live matrix: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
