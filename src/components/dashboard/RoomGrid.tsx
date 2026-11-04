import { FiHome } from 'react-icons/fi';
import type { HotelSnapshot } from '../../lib/api';
import { Typography } from '../ui/Typography';

export const ROOM_STATUS: Record<string, { label: string; color: string }> = {
  occupied: { label: 'occupied', color: '#2563eb' },
  clean: { label: 'clean', color: '#059669' },
  dirty: { label: 'dirty', color: '#dc2626' },
  blocked: { label: 'blocked', color: '#7c3aed' },
  inspected: { label: 'inspected', color: '#0891b2' },
};

export function RoomGrid({ rooms }: { rooms: HotelSnapshot['rooms'] }) {
  const counts = rooms.reduce<Record<string, number>>((acc, room) => {
    acc[room.status] = (acc[room.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="section-card" aria-label="Room status">
      <div className="section-head">
        <Typography variant="h2" className="section-title">
          <FiHome aria-hidden /> Rooms
        </Typography>
        <div className="legend">
          {Object.entries(ROOM_STATUS)
            .filter(([status]) => counts[status])
            .map(([status, meta]) => (
              <span key={status}>
                <span className="dot" style={{ background: meta.color }} />
                {meta.label} ({counts[status]})
              </span>
            ))}
        </div>
      </div>
      <div className="room-grid">
        {rooms.map((room) => {
          const meta = ROOM_STATUS[room.status] ?? { label: room.status, color: '#64748b' };
          return (
            <span
              key={room.number}
              className="room-chip"
              title={`${room.number} ${room.type} - ${room.status}, $${room.rate}/night`}
            >
              <span className="dot" style={{ background: meta.color }} />
              {room.number} {meta.label}
              <small>{room.type}</small>
            </span>
          );
        })}
      </div>
    </section>
  );
}
