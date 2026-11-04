import type { RolePreset } from './role-presets';

interface SuggestionChipsProps {
  activeRoleData: RolePreset;
  handleSend: (text: string) => void;
}

export function SuggestionChips({ activeRoleData, handleSend }: SuggestionChipsProps) {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}
    >
      {activeRoleData.chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => handleSend(chip)}
          style={{
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            color: '#334155',
            borderRadius: 16,
            padding: '6px 13px',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
