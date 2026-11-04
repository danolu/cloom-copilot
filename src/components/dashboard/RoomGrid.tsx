import { FiHome } from 'react-icons/fi';
import type { HotelSnapshot } from '../../lib/api';
import { Card } from '../ui/Card';
import { ROOM_STATUS_META, roomStatusMeta } from './tokens';

export function RoomGrid({ rooms }: { rooms: HotelSnapshot['rooms'] }) {
  const counts = rooms.reduce<Record<string, number>>((acc, room) => {
    acc[room.status] = (acc[room.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card
      aria-label="Room status"
      title="Rooms"
      icon={<FiHome aria-hidden />}
      actions={
        <div className="legend">
          {Object.entries(ROOM_STATUS_META)
            .filter(([status]) => counts[status])
            .map(([status, meta]) => (
              <span key={status}>
                <span className="dot" style={{ background: meta.color }} />
                {meta.label} ({counts[status]})
              </span>
            ))}
        </div>
      }
    >
      <div className="room-grid">
        {rooms.map((room) => {
          const meta = roomStatusMeta(room.status);
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
    </Card>
  );
}
