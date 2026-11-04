import { ShieldCheck } from 'lucide-react';
import { ROLE_PRESETS } from './role-presets';

interface RoleSwitcherProps {
  role: string;
  onRoleChange: (role: string) => void;
  onReset?: () => void;
}

export function RoleSwitcher({ role, onRoleChange, onReset }: RoleSwitcherProps) {
  const canReset = role === 'demo-admin' || role === 'demo-superadmin';
  return (
    <div
      style={{
        background: '#f8fafc',
        padding: '8px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
      }}
    >
      <span
        style={{
          color: 'var(--text-secondary)',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <ShieldCheck size={14} color="var(--accent-emerald)" />
        Staff Role:
      </span>
      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        style={{
          background: '#ffffff',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6,
          padding: '5px 8px',
          fontSize: 12,
          outline: 'none',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        {Object.entries(ROLE_PRESETS).map(([id, info]) => (
          <option key={id} value={id}>
            {info.avatar} {info.name} — {info.title}
          </option>
        ))}
      </select>
      {canReset && onReset && (
        <button
          onClick={onReset}
          title="Restore the seeded demo state for this session"
          style={{
            background: '#ffffff',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: 12,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          ♻️ Reset demo
        </button>
      )}
    </div>
  );
}
