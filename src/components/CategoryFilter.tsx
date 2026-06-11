'use client';

import {
  Layers, Trophy, Target, CircleDot, Zap,
  Flag, Newspaper, Film, Music2, Wifi,
} from 'lucide-react';
import { CategoryId } from '@/types/channel';
import type { LucideIcon } from 'lucide-react';

const CATEGORIES: { id: CategoryId; label: string; icon: LucideIcon }[] = [
  { id: 'all',           label: 'All',          icon: Layers    },
  { id: 'sports',        label: 'Sports',        icon: Trophy    },
  { id: 'cricket',       label: 'Cricket',       icon: Target    },
  { id: 'football',      label: 'Football',      icon: CircleDot },
  { id: 'ufc',           label: 'UFC',           icon: Zap       },
  { id: 'bangladesh',    label: 'Bangladesh',    icon: Flag      },
  { id: 'news',          label: 'News',          icon: Newspaper },
  { id: 'entertainment', label: 'Entertainment', icon: Film      },
  { id: 'music',         label: 'Music',         icon: Music2    },
];

interface Props {
  active: CategoryId;
  onChange: (cat: CategoryId) => void;
  showOnlineOnly: boolean;
  onToggleOnlineOnly: () => void;
  layout?: 'horizontal' | 'vertical';
}

export default function CategoryFilter({
  active, onChange, showOnlineOnly, onToggleOnlineOnly, layout = 'horizontal',
}: Props) {

  /* ── Vertical (sidebar) ── */
  if (layout === 'vertical') {
    return (
      <nav className="flex flex-col py-1.5">
        <div
          className="px-4 pt-1 pb-2 text-xs font-bold tracking-widest uppercase"
          style={{ color: 'var(--text-2)' }}
        >
          Browse
        </div>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className="flex items-center gap-3 w-full px-4 py-2 text-xs font-medium transition-all duration-150"
              style={{
                borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                background: isActive ? 'var(--bg-active)' : 'transparent',
                color: isActive ? 'var(--text-0)' : 'var(--text-1)',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon
                size={13}
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-2)', flexShrink: 0 }}
              />
              {cat.label}
            </button>
          );
        })}

        <div style={{ margin: '4px 16px', borderTop: '1px solid var(--glass-border)' }} />

        <button
          onClick={onToggleOnlineOnly}
          className="flex items-center gap-3 w-full px-4 py-2 text-xs font-medium transition-all duration-150"
          style={{
            borderLeft: `2px solid ${showOnlineOnly ? 'var(--online)' : 'transparent'}`,
            background: showOnlineOnly ? 'var(--online-bg)' : 'transparent',
            color: showOnlineOnly ? 'var(--online)' : 'var(--text-1)',
          }}
          onMouseEnter={(e) => { if (!showOnlineOnly) e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { if (!showOnlineOnly) e.currentTarget.style.background = 'transparent'; }}
        >
          <Wifi
            size={13}
            style={{ color: showOnlineOnly ? 'var(--online)' : 'var(--text-2)', flexShrink: 0 }}
          />
          Live Only
        </button>
      </nav>
    );
  }

  /* ── Horizontal pills (mobile/tablet) ── */
  return (
    <div
      className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-3 py-2.5"
      style={{ borderBottom: '1px solid var(--glass-border)' }}
    >
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="flex items-center gap-1.5 shrink-0 whitespace-nowrap font-semibold transition-all duration-200"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              background: isActive ? 'var(--accent-gradient)' : 'var(--glass)',
              border: `1px solid ${isActive ? 'transparent' : 'var(--glass-border)'}`,
              color: isActive ? '#fff' : 'var(--text-1)',
              boxShadow: isActive ? '0 2px 12px var(--accent-glow)' : 'none',
              transform: isActive ? 'translateY(-1px)' : 'none',
            }}
          >
            <Icon size={11} strokeWidth={2.5} />
            {cat.label}
          </button>
        );
      })}

      <button
        onClick={onToggleOnlineOnly}
        className="flex items-center gap-1.5 shrink-0 whitespace-nowrap font-semibold transition-all duration-200"
        style={{
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 11,
          background: showOnlineOnly ? 'rgba(52,199,89,0.15)' : 'var(--glass)',
          border: `1px solid ${showOnlineOnly ? 'rgba(52,199,89,0.30)' : 'var(--glass-border)'}`,
          color: showOnlineOnly ? 'var(--online)' : 'var(--text-1)',
          boxShadow: showOnlineOnly ? '0 2px 10px rgba(52,199,89,0.15)' : 'none',
          transform: showOnlineOnly ? 'translateY(-1px)' : 'none',
        }}
      >
        <Wifi size={11} strokeWidth={2.5} />
        Live Only
      </button>
    </div>
  );
}
