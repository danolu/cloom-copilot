'use client';

import * as Select from '@radix-ui/react-select';
import { FiCheck, FiChevronDown, FiRotateCcw, FiShield } from 'react-icons/fi';
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
  const active = ROLE_PRESETS[role] ?? ROLE_PRESETS['demo-admin'];
  return (
    <div className="rolebar">
      <Typography variant="overline" tone="muted" as="span" className="rolebar-label">
        <FiShield aria-hidden /> Staff role
      </Typography>
      <Select.Root value={role} onValueChange={onRoleChange}>
        <Select.Trigger className="select-trigger" aria-label="Staff role">
          <span className="select-trigger-value">
            {active.name} - {active.title}
          </span>
          <Select.Icon className="select-icon">
            <FiChevronDown aria-hidden />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="select-content" position="popper" sideOffset={6}>
            <Select.Viewport className="select-viewport">
              {Object.entries(ROLE_PRESETS).map(([id, info]) => (
                <Select.Item key={id} value={id} className="select-item">
                  <Select.ItemText>
                    {info.name} - {info.title}
                  </Select.ItemText>
                  <Select.ItemIndicator className="select-item-indicator">
                    <FiCheck aria-hidden />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
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
