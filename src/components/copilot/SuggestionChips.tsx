'use client';

import type { ComponentType } from 'react';
import {
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiClipboard,
  FiCreditCard,
  FiFileText,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiMessageSquare,
  FiRotateCcw,
  FiSearch,
  FiSettings,
  FiSlash,
  FiSunrise,
  FiTag,
  FiTool,
  FiUserPlus,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { Button } from '../ui/Button';
import type { RolePreset } from './role-presets';

// Chips are plain command text, so the icon is inferred from the action the
// chip performs. First match wins; keep specific actions above generic ones.
const CHIP_ICONS: Array<[RegExp, ComponentType]> = [
  [/add team member/i, FiUserPlus],
  [/morning digest/i, FiSunrise],
  [/express/i, FiZap],
  [/check in/i, FiLogIn],
  [/check out/i, FiLogOut],
  [/settle|charge|dinner|minibar|bill for/i, FiCreditCard],
  [/folio/i, FiFileText],
  [/revenue/i, FiBarChart2],
  [/team/i, FiUsers],
  [/approval/i, FiClipboard],
  [/rates?/i, FiTag],
  [/arrival|reservation/i, FiCalendar],
  [/cleaned/i, FiCheckCircle],
  [/dirty/i, FiBell],
  [/block/i, FiSlash],
  [/fix|leaking|maintenance|tap/i, FiTool],
  [/audit/i, FiSearch],
  [/settings/i, FiSettings],
  [/undo/i, FiRotateCcw],
  [/tasks/i, FiCheckSquare],
  [/briefing|dashboard|rooms status/i, FiHome],
  [/guest request/i, FiBell],
];

export function chipIcon(chip: string): ComponentType {
  return CHIP_ICONS.find(([pattern]) => pattern.test(chip))?.[1] ?? FiMessageSquare;
}

interface SuggestionChipsProps {
  activeRoleData: RolePreset;
  handleSend: (text: string) => void;
}

export function SuggestionChips({ activeRoleData, handleSend }: SuggestionChipsProps) {
  return (
    <div className="chips" aria-label="Suggested actions">
      {activeRoleData.chips.map((chip) => {
        const Icon = chipIcon(chip);
        return (
          <Button variant="chip" size="sm" key={chip} onClick={() => handleSend(chip)}>
            <span className="chip-icon" aria-hidden>
              <Icon />
            </span>
            {chip}
          </Button>
        );
      })}
    </div>
  );
}
