'use client';

import { useCallback, useEffect, useState } from 'react';
import { getState, type HotelSnapshot } from '../../lib/api';

const STATUS_COLOR: Record<string, string> = {
  occupied: '#2563eb',
  clean: '#059669',
  dirty: '#dc2626',
  blocked: '#7c3aed',
  inspected: '#0891b2',
};

// Mini overview so judges can watch the property change as the copilot acts:
// stat tiles, a colour-coded room grid, folio balances, and the audit trail.
// Polls the session snapshot every 3 seconds; collapsible to save chat space.
export function JudgeDashboard() {
  const [open, setOpen] = useState(true);
  const [snap, setSnap] = useState<HotelSnapshot | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSnap(await getState());
    } catch {
      /* server not ready yet */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  return (
    <section style={{ borderBottom: '1px solid var(--border-subtle)', background: '#fbfdff', padding: '8px 14px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-primary)',
          padding: 0,
        }}
        aria-expanded={open}
      >
        {open ? '▾' : '▸'} 🏨 Judge overview — live property state {snap ? `(${snap.hotel})` : ''}
      </button>
      {open && snap && (
        <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
            {[
              ['Occupancy', snap.occupancy],
              ['Revenue today', `${snap.currency} ${snap.revenueToday}`],
              ['Open tasks', snap.openTasks],
              ['Approvals', snap.pendingApprovals],
              ['Blocked departures', snap.blockedDepartures],
              ['Arrivals', snap.arrivals.length],
            ].map(([label, value]) => (
              <span
                key={label}
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '4px 8px',
                }}
              >
                {label}: <strong>{value}</strong>
              </span>
            ))}
            <button
              onClick={refresh}
              style={{
                fontSize: 12,
                cursor: 'pointer',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                background: '#fff',
                padding: '4px 8px',
              }}
            >
              ↻ Refresh
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} aria-label="Room status grid">
            {snap.rooms.map((r) => (
              <span
                key={r.number}
                title={`${r.number} ${r.type} — ${r.status}, $${r.rate}/night`}
                style={{
                  fontSize: 11,
                  color: '#fff',
                  background: STATUS_COLOR[r.status] || '#64748b',
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontWeight: 600,
                }}
              >
                {r.number} {r.status}
              </span>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              fontSize: 11,
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Folios</strong>
              {snap.folios.map((f) => (
                <div key={f.room}>
                  Room {f.room} {f.guest}: ${f.balance} ({f.status})
                </div>
              ))}
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Recent changes</strong>
              {snap.audit.length === 0 && <div>No changes yet — ask the copilot to do something.</div>}
              {snap.audit.slice(0, 6).map((a, i) => (
                <div key={`${a.at}-${i}`}>
                  • {a.action}: {a.detail}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
