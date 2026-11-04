'use client';

import { useState, type CSSProperties } from 'react';
import { FiHome } from 'react-icons/fi';
import type { HotelSnapshot } from '../../lib/api';
import { formatMoney } from '../../lib/money';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ROOM_STATUS_META, roomStatusMeta } from './tokens';

type Room = HotelSnapshot['rooms'][number];

function roomContext(room: Room, currency: string, folio?: HotelSnapshot['folios'][number]): string {
  switch (room.status) {
    case 'occupied':
      return folio ? `${folio.guest} · ${formatMoney(folio.balance, currency)} on folio` : 'Guest in house';
    case 'clean':
      return 'Ready to sell';
    case 'inspected':
      return 'Inspected · ready to sell';
    case 'dirty':
      return 'Awaiting housekeeping';
    case 'blocked':
      return 'Out of service';
    default:
      return room.status;
  }
}

export function RoomGrid({
  rooms,
  folios = [],
  currency = 'USD',
}: {
  rooms: HotelSnapshot['rooms'];
  folios?: HotelSnapshot['folios'];
  currency?: string;
}) {
  const [filter, setFilter] = useState('all');
  const counts = rooms.reduce<Record<string, number>>((acc, room) => {
    acc[room.status] = (acc[room.status] ?? 0) + 1;
    return acc;
  }, {});
  const folioByRoom = new Map(folios.map((folio) => [folio.room, folio]));
  const visible = filter === 'all' ? rooms : rooms.filter((room) => room.status === filter);

  return (
    <Card aria-label="Room status" title="Rooms" icon={<FiHome aria-hidden />}>
      <div className="room-filters" role="group" aria-label="Filter rooms by status">
        <button
          type="button"
          className={`room-filter${filter === 'all' ? ' room-filter-active' : ''}`}
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All rooms ({rooms.length})
        </button>
        {Object.entries(ROOM_STATUS_META)
          .filter(([status]) => counts[status])
          .map(([status, meta]) => (
            <button
              type="button"
              key={status}
              className={`room-filter${filter === status ? ' room-filter-active' : ''}`}
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
            >
              <span className="dot" style={{ background: meta.color }} />
              {meta.label} ({counts[status]})
            </button>
          ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState>No rooms with this status right now.</EmptyState>
      ) : (
        <div className="room-grid">
          {visible.map((room) => {
            const meta = roomStatusMeta(room.status);
            const style = {
              '--room-accent': meta.color,
              '--room-soft': meta.background,
            } as CSSProperties;
            return (
              <article key={room.number} className="room-card" style={style}>
                <div className="room-card-top">
                  <span className="room-number">{room.number}</span>
                  <span className="room-status">
                    <span className="dot" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                </div>
                <div className="room-type">{room.type}</div>
                <div className="room-meta">
                  <span>Floor {room.number.charAt(0)}</span>
                  <span className="room-rate">{formatMoney(room.rate, currency)} / night</span>
                </div>
                <div className="room-context">{roomContext(room, currency, folioByRoom.get(room.number))}</div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
