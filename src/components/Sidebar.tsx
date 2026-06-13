'use client';

import { Channel, CategoryId } from '@/types/channel';
import CategoryFilter from './CategoryFilter';
import ChannelCard from './ChannelCard';
import { RefreshCw } from 'lucide-react';

interface Props {
  channels: Channel[];
  allChannels: Channel[];
  loading: boolean;
  error: string | null;
  category: CategoryId;
  onCategory: (c: CategoryId) => void;
  showOnlineOnly: boolean;
  onToggleOnlineOnly: () => void;
  activeId: string | null;
  onSelect: (ch: Channel) => void;
  onReload: () => void;
  hasMore?: boolean;
  onShowMore?: () => void;
  isPinned: (id: string) => boolean;
  onTogglePin: (id: string) => void;
}

export default function Sidebar({
  channels, allChannels, loading, error,
  category, onCategory, showOnlineOnly, onToggleOnlineOnly,
  activeId, onSelect, onReload, hasMore, onShowMore, isPinned, onTogglePin,
}: Props) {
  const liveCount = allChannels.filter((c) => c.status === 'online').length;
  const total     = allChannels.length;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-1)' }}>

      {/* Stats row */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-2">
          {loading ? (
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Fetching channels…</span>
          ) : (
            <>
              <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--online)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-1)' }}>
                <span style={{ color: 'var(--online)', fontWeight: 700 }}>{liveCount}</span>
                {' live · '}
                <span style={{ color: 'var(--text-2)' }}>{total} total</span>
              </span>
            </>
          )}
        </div>
        <button
          onClick={onReload}
          disabled={loading}
          className="w-7 h-7 flex items-center justify-center transition-all"
          style={{ color: 'var(--text-2)', borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-0)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
          title="Reload channels"
        >
          <RefreshCw size={12} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Category nav */}
      <div className="shrink-0" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <CategoryFilter
          active={category}
          onChange={onCategory}
          showOnlineOnly={showOnlineOnly}
          onToggleOnlineOnly={onToggleOnlineOnly}
          layout="vertical"
        />
      </div>

      {/* Filter result count */}
      {!loading && !error && (
        <div
          className="flex items-center px-4 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {channels.length} channel{channels.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto">
        {loading && Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="skeleton flex items-center gap-3 px-3" style={{ padding: '10px 12px' }}>
            <div className="shrink-0" style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <div style={{ height: 9, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '65%' }} />
              <div style={{ height: 7, background: 'rgba(255,255,255,0.03)', borderRadius: 4, width: '40%' }} />
            </div>
          </div>
        ))}

        {error && !loading && (
          <div className="p-6 text-center">
            <p className="mb-3" style={{ fontSize: 12, color: 'var(--text-1)' }}>{error}</p>
            <button
              onClick={onReload}
              style={{
                padding: '8px 16px',
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--accent-gradient)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                boxShadow: '0 4px 14px var(--accent-glow)',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && channels.length === 0 && (
          <div className="p-8 text-center" style={{ fontSize: 12, color: 'var(--text-2)' }}>
            No channels match
          </div>
        )}

        {!loading && !error && channels.map((ch) => (
          <ChannelCard
            key={ch.id}
            channel={ch}
            isActive={ch.id === activeId}
            isPinned={isPinned(ch.id)}
            onTogglePin={() => onTogglePin(ch.id)}
            onClick={() => onSelect(ch)}
          />
        ))}

        {hasMore && !loading && !error && (
          <div className="flex justify-center py-3 px-3">
            <button
              onClick={onShowMore}
              className="w-full btn-glass"
              style={{ padding: '7px 12px', fontSize: 11, fontWeight: 600 }}
            >
              Load more channels
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
