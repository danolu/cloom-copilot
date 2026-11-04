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
            <Skeleton width={38} height={38} className="skeleton-icon" />
            <div className="skeleton-stat-copy">
              <Skeleton width="58%" height={11} />
              <Skeleton width="72%" height={22} />
              <Skeleton width="48%" height={11} />
            </div>
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
          <Skeleton width={100} height={30} className="skeleton-chip" />
          <Skeleton width={112} height={30} className="skeleton-chip" />
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

// Primary surface of the app: live property state stays at the top, and the
// copilot chat floats over it as a popover instead of pushing it down.
export function PropertyDashboard() {
  const { snapshot, refresh, lastUpdated, loadError } = useHotelSnapshot();

  return (
    <main className="dashboard">
      <div className="dashboard-inner">
        <div className="dashboard-head">
          <div>
            <Typography variant="display">Property overview</Typography>
            <Typography variant="body-sm" tone="muted" className="dashboard-subtitle">
              {snapshot
                ? `${snapshot.hotel} - live property state, updated by every copilot action.`
                : loadError
                  ? 'Live property state unavailable — retrying automatically.'
                  : 'Loading live property state…'}
            </Typography>
          </div>
          <div className="dashboard-head-actions">
            {snapshot && (
              <span
                className="live-dot"
                title={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : undefined}
              >
                Live
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
          <div role="status" aria-live="polite" aria-label="Loading live property state">
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
            Live property state is not available yet. It retries automatically every few seconds.
          </EmptyState>
        )}

        {snapshot && (
          <>
            <div className="stat-grid">
              <StatCard
                label="Occupancy"
                value={snapshot.occupancy}
                hint="rooms occupied"
                icon={<FiHome />}
                tone="blue"
              />
              <StatCard
                label="Revenue today"
                value={`${snapshot.currency} ${snapshot.revenueToday}`}
                hint="posted to folios"
                icon={<FiTrendingUp />}
                tone="green"
              />
              <StatCard
                label="Open tasks"
                value={snapshot.openTasks}
                hint="across departments"
                icon={<FiCheckSquare />}
                tone="amber"
              />
              <StatCard
                label="Approvals"
                value={snapshot.pendingApprovals}
                hint="awaiting sign-off"
                icon={<FiClipboard />}
                tone="violet"
              />
              <StatCard
                label="Blocked departures"
                value={snapshot.blockedDepartures}
                hint="unpaid folio balances"
                icon={<FiAlertTriangle />}
                tone="red"
              />
              <StatCard
                label="Arrivals"
                value={snapshot.arrivals.length}
                hint="expected today"
                icon={<FiCalendar />}
                tone="cyan"
              />
            </div>
            <RoomGrid rooms={snapshot.rooms} />
            <DashboardPanels snapshot={snapshot} />
          </>
        )}
      </div>
    </main>
  );
}
