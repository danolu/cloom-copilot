'use client';

import * as Tabs from '@radix-ui/react-tabs';
import {
  FiActivity,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiStar,
  FiUser,
} from 'react-icons/fi';
import { Badge, statusTone } from '../ui/Badge';
import { Typography } from '../ui/Typography';
import type { HotelSnapshot } from '../../lib/api';

function Empty({ children }: { children: string }) {
  return <div className="panel-empty">{children}</div>;
}

// Folios, arrivals/tasks, approvals and the audit trail behind Radix Tabs,
// so the dashboard stays scannable instead of stacking every list at once.
export function DashboardPanels({ snapshot }: { snapshot: HotelSnapshot }) {
  return (
    <section className="section-card" aria-label="Property details">
      <Tabs.Root defaultValue="folios">
        <Tabs.List className="tabs-list" aria-label="Property details">
          <Tabs.Trigger className="tabs-trigger" value="folios">
            <FiCreditCard aria-hidden /> Folios <Badge tone="count">{snapshot.folios.length}</Badge>
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="arrivals">
            <FiCalendar aria-hidden /> Arrivals <Badge tone="count">{snapshot.arrivals.length}</Badge>
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="tasks">
            <FiCheckSquare aria-hidden /> Tasks <Badge tone="count">{snapshot.tasks.length}</Badge>
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="approvals">
            <FiClipboard aria-hidden /> Approvals <Badge tone="count">{snapshot.approvals.length}</Badge>
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="activity">
            <FiActivity aria-hidden /> Recent changes
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="folios">
          <div className="panel-list">
            {snapshot.folios.length === 0 && <Empty>No folios yet.</Empty>}
            {snapshot.folios.map((folio) => (
              <div className="panel-row" key={folio.room}>
                <div className="panel-row-main">
                  <span className="row-icon" aria-hidden>
                    <FiFileText />
                  </span>
                  <div>
                    <Typography variant="body-sm" as="div">
                      Room {folio.room} - {folio.guest}
                    </Typography>
                    <Typography variant="caption" tone="muted" as="div">
                      Folio balance
                    </Typography>
                  </div>
                </div>
                <div className="panel-row-side">
                  <span className="amount">
                    {snapshot.currency} {folio.balance}
                  </span>
                  <Badge tone={statusTone(folio.status)}>{folio.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="arrivals">
          <div className="panel-list">
            {snapshot.arrivals.length === 0 && <Empty>No arrivals expected today.</Empty>}
            {snapshot.arrivals.map((arrival, index) => (
              <div className="panel-row" key={`${arrival.guest}-${index}`}>
                <div className="panel-row-main">
                  <span className="row-icon" aria-hidden>
                    <FiUser />
                  </span>
                  <div>
                    <Typography variant="body-sm" as="div">
                      {arrival.guest}
                    </Typography>
                    <Typography variant="caption" tone="muted" as="div">
                      {arrival.roomType} - ETA {arrival.eta}
                    </Typography>
                  </div>
                </div>
                {arrival.vip && (
                  <Badge tone="open">
                    <FiStar aria-hidden /> VIP
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="tasks">
          <div className="panel-list">
            {snapshot.tasks.length === 0 && <Empty>No open tasks. Ask the copilot to create one.</Empty>}
            {snapshot.tasks.map((task) => (
              <div className="panel-row" key={task.id}>
                <div className="panel-row-main">
                  <span className="row-icon" aria-hidden>
                    <FiCheckSquare />
                  </span>
                  <div>
                    <Typography variant="body-sm" as="div">
                      {task.title}
                    </Typography>
                    <Typography variant="caption" tone="muted" as="div">
                      {task.id} - {task.assignee}
                    </Typography>
                  </div>
                </div>
                <Badge tone="other">{task.priority}</Badge>
              </div>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="approvals">
          <div className="panel-list">
            {snapshot.approvals.length === 0 && <Empty>No pending approvals.</Empty>}
            {snapshot.approvals.map((approval) => (
              <div className="panel-row" key={approval.id}>
                <div className="panel-row-main">
                  <span className="row-icon" aria-hidden>
                    <FiClipboard />
                  </span>
                  <div>
                    <Typography variant="body-sm" as="div">
                      {approval.title}
                    </Typography>
                    <Typography variant="caption" tone="muted" as="div">
                      {approval.id} - awaiting sign-off
                    </Typography>
                  </div>
                </div>
                <Badge tone="open">Pending</Badge>
              </div>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="activity">
          <div className="panel-list">
            {snapshot.audit.length === 0 && <Empty>No changes yet - ask the copilot to do something.</Empty>}
            {snapshot.audit.slice(0, 10).map((entry, index) => (
              <div className="panel-row" key={`${entry.at}-${index}`}>
                <div className="panel-row-main">
                  <span className="row-icon" aria-hidden>
                    <FiActivity />
                  </span>
                  <div>
                    <Typography variant="body-sm" as="div">
                      {entry.action}: {entry.detail}
                    </Typography>
                    <Typography variant="caption" tone="muted" as="div">
                      {entry.actor} - {entry.at}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
