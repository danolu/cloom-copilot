'use client';

import {
  FiAlertTriangle,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCloudOff,
  FiHome,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi';
import { useHotelSnapshot } from '../../hooks/useHotelSnapshot';
import { formatMoney } from '../../lib/money';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';
import { DashboardPanels } from './DashboardPanels';
import { RoomGrid } from './RoomGrid';
import { StatCard } from './StatCard';

// Loading placeholders with the same layout as the real dashboard.
function DashboardSkeleton() {
  return (
    <div aria-hidden>
      <div className="stat-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-card-top">
              <Skeleton width="52%" height={11} />
              <Skeleton width={34} height={34} className="skeleton-icon" />
            </div>
            <Skeleton width="46%" height={26} />
            <Skeleton width="68%" height={11} />
            <Skeleton width="100%" height={1} />
            <Skeleton width="82%" height={11} />
          </div>
        ))}
      </div>
      <div className="section-card skeleton-section">
        <Skeleton width="30%" height={16} />
        <div className="skeleton-chips">
          <Skeleton width={104} height={30} className="skeleton-chip" />
          <Skeleton width={118} height={30} className="skeleton-chip" />
          <Skeleton width={96} height={30} className="skeleton-chip" />
          <Skeleton width={122} height={30} className="skeleton-chip" />
        </div>
        <div className="skeleton-room-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} width="100%" height={104} className="skeleton-room" />
          ))}
        </div>
      </div>
      <div className="section-card skeleton-section">
        <Skeleton width="42%" height={16} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="88%" height={14} />
        <Skeleton width="76%" height={14} />
      </div>
    </div>
  );
}

export function PropertyDashboard() {
  const { snapshot, refresh, lastUpdated, loadError } = useHotelSnapshot();

  const occupiedRooms = snapshot?.rooms.filter((room) => room.status === 'occupied') ?? [];
  const readyRooms = snapshot?.rooms.filter((room) => room.status === 'clean' || room.status === 'inspected') ?? [];
  const dirtyRooms = snapshot?.rooms.filter((room) => room.status === 'dirty') ?? [];
  const occupancyPct = snapshot?.rooms.length ? Math.round((occupiedRooms.length / snapshot.rooms.length) * 100) : 0;
  const openFolios = snapshot?.folios.filter((folio) => folio.balance > 0) ?? [];
  const openFolioTotal = openFolios.reduce((sum, folio) => sum + folio.balance, 0);
  const highPriorityTasks = snapshot?.tasks.filter((task) => task.priority.toLowerCase() === 'high') ?? [];
  const taskDepartments = new Set(snapshot?.tasks.map((task) => task.assignee)).size;
  const nextArrival = snapshot ? [...snapshot.arrivals].sort((a, b) => a.eta.localeCompare(b.eta))[0] : undefined;
  const vipArrivals = snapshot?.arrivals.filter((arrival) => arrival.vip).length ?? 0;
  const attentionCount = snapshot ? snapshot.blockedDepartures + snapshot.pendingApprovals : 0;

  return (
    <main className="dashboard">
      <div className="dashboard-inner">
        <div className="dashboard-head">
          <Typography variant="display">Property overview</Typography>
          <div className="dashboard-head-actions">
            {snapshot && (
              <span className="live-dot">
                Live
                {lastUpdated
                  ? ` · updated ${lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                  : ''}
              </span>
            )}
            <Tooltip label="Refresh property state">
              <Button variant="secondary" size="sm" onClick={() => void refresh()}>
                <FiRefreshCw aria-hidden /> Refresh
              </Button>
            </Tooltip>
          </div>
        </div>

        {!snapshot && !loadError && (
          <div role="status" aria-live="polite" aria-label="Loading property overview">
            <DashboardSkeleton />
          </div>
        )}

        {!snapshot && loadError && (
          <EmptyState
            variant="page"
            icon={<FiCloudOff aria-hidden />}
            action={
              <Button variant="secondary" size="sm" onClick={() => void refresh()}>
                <FiRefreshCw aria-hidden /> Try again
              </Button>
            }
          >
            Property state is not available yet. It retries automatically every few seconds.
          </EmptyState>
        )}

        {snapshot && (
          <>
            <div className="stat-grid">
              <StatCard
                featured
                label="Occupancy"
                value={`${occupancyPct}%`}
                hint={`${occupiedRooms.length} of ${snapshot.rooms.length} rooms occupied`}
                progress={occupancyPct}
                detail={`${snapshot.rooms.length - occupiedRooms.length} available · ${readyRooms.length} ready to sell`}
                icon={<FiHome />}
                tone="blue"
              />
              <StatCard
                label="Revenue today"
                value={formatMoney(snapshot.revenueToday, snapshot.currency)}
                hint="posted to folios"
                detail={`${formatMoney(openFolioTotal, snapshot.currency)} open across ${openFolios.length} ${openFolios.length === 1 ? 'folio' : 'folios'}`}
                icon={<FiTrendingUp />}
                tone="green"
              />
              <StatCard
                label="Arrivals"
                value={snapshot.arrivals.length}
                hint="expected today"
                detail={
                  nextArrival
                    ? `Next ${nextArrival.eta} · ${nextArrival.guest}${vipArrivals ? ` · ${vipArrivals} VIP` : ''}`
                    : 'No arrivals expected'
                }
                icon={<FiCalendar />}
                tone="cyan"
              />
              <StatCard
                label="Turnovers"
                value={dirtyRooms.length}
                hint="rooms to clean"
                detail={
                  dirtyRooms.length
                    ? `Rooms ${dirtyRooms.map((room) => room.number).join(' · ')}`
                    : 'All rooms turned over'
                }
                icon={<FiRefreshCw />}
                tone="amber"
              />
              <StatCard
                label="Open tasks"
                value={snapshot.openTasks}
                hint="across departments"
                detail={`${highPriorityTasks.length} high priority · ${taskDepartments} ${taskDepartments === 1 ? 'department' : 'departments'}`}
                icon={<FiCheckSquare />}
                tone="violet"
              />
              <StatCard
                label="Needs attention"
                value={attentionCount}
                hint="items need action"
                detail={`${snapshot.blockedDepartures} blocked departures · ${snapshot.pendingApprovals} approvals`}
                icon={attentionCount ? <FiAlertTriangle /> : <FiClipboard />}
                tone={snapshot.blockedDepartures ? 'red' : attentionCount ? 'amber' : 'green'}
              />
            </div>
            <RoomGrid rooms={snapshot.rooms} folios={snapshot.folios} currency={snapshot.currency} />
            <DashboardPanels snapshot={snapshot} />
          </>
        )}
      </div>
    </main>
  );
}
