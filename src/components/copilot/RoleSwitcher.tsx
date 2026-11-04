'use client';

import { FiRotateCcw, FiShield } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Typography } from '../ui/Typography';
import { ROLE_PRESETS } from './role-presets';

interface RoleSwitcherProps {
  role: string;
  onRoleChange: (role: string) => void;
  onReset?: () => void;
}

export function RoleSwitcher({ role, onRoleChange, onReset }: RoleSwitcherProps) {
  const canReset = role === 'demo-admin' || role === 'demo-superadmin';
  return (
    <div className="rolebar">
      <Typography variant="overline" tone="muted" as="span" className="rolebar-label">
        <FiShield aria-hidden /> Staff role
      </Typography>
      <select
        className="role-select"
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        aria-label="Staff role"
      >
        {Object.entries(ROLE_PRESETS).map(([id, info]) => (
          <option key={id} value={id}>
            {info.name} - {info.title}
          </option>
        ))}
      </select>
      {canReset && onReset && (
        <Tooltip label="Restore the seeded demo state for this session">
          <Button variant="secondary" size="sm" className="btn-reset" onClick={onReset}>
            <FiRotateCcw aria-hidden /> Reset demo
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
