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
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';
import { DashboardPanels } from './DashboardPanels';
import { RoomGrid } from './RoomGrid';
import { StatCard } from './StatCard';

// Primary surface of the app: live property state stays at the top, and the
// copilot chat floats over it as a popover instead of pushing it down.
export function PropertyDashboard() {
  const { snapshot, refresh, lastUpdated } = useHotelSnapshot();

  return (
    <main className="dashboard">
      <div className="dashboard-inner">
        <div className="dashboard-head">
          <div>
            <Typography variant="display">Property overview</Typography>
            <Typography variant="body-sm" tone="muted" className="dashboard-subtitle">
              {snapshot
                ? `${snapshot.hotel} - live property state, updated by every copilot action.`
                : 'Loading live property state...'}
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

        {!snapshot && (
          <div className="dashboard-empty">
            <FiCloudOff aria-hidden />
            <Typography variant="body-sm" tone="muted">
              Live property state is not available yet. It retries automatically every few seconds.
            </Typography>
            <Button variant="secondary" size="sm" onClick={() => void refresh()}>
              <FiRefreshCw aria-hidden /> Try again
            </Button>
          </div>
        )}

        {snapshot && (
          <>
            <div className="stat-grid">
              <StatCard
                label="Occupancy"
                value={snapshot.occupancy}
                hint="rooms occupied"
                icon={<FiHome />}
                iconBackground="#eff6ff"
                iconColor="#2563eb"
              />
              <StatCard
                label="Revenue today"
                value={`${snapshot.currency} ${snapshot.revenueToday}`}
                hint="posted to folios"
                icon={<FiTrendingUp />}
                iconBackground="#ecfdf5"
                iconColor="#059669"
              />
              <StatCard
                label="Open tasks"
                value={snapshot.openTasks}
                hint="across departments"
                icon={<FiCheckSquare />}
                iconBackground="#fffbeb"
                iconColor="#d97706"
              />
              <StatCard
                label="Approvals"
                value={snapshot.pendingApprovals}
                hint="awaiting sign-off"
                icon={<FiClipboard />}
                iconBackground="#f5f3ff"
                iconColor="#7c3aed"
              />
              <StatCard
                label="Blocked departures"
                value={snapshot.blockedDepartures}
                hint="unpaid folio balances"
                icon={<FiAlertTriangle />}
                iconBackground="#fef2f2"
                iconColor="#dc2626"
              />
              <StatCard
                label="Arrivals"
                value={snapshot.arrivals.length}
                hint="expected today"
                icon={<FiCalendar />}
                iconBackground="#ecfeff"
                iconColor="#0891b2"
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
