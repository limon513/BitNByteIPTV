'use client';

import { useState, useEffect } from 'react';
import { Channel } from '@/types/channel';
import { useChannels } from '@/hooks/useChannels';
import { useStreamChecker } from '@/hooks/useStreamChecker';
import { usePinnedChannels } from '@/hooks/usePinnedChannels';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import CategoryFilter from '@/components/CategoryFilter';
import ChannelCard from '@/components/ChannelCard';
import HLSPlayer from '@/components/Player/HLSPlayer';
import PlayerPlaceholder from '@/components/Player/PlayerPlaceholder';
import Footer from '@/components/Footer';
import { RefreshCw, Tv2 } from 'lucide-react';

const MOBILE_CHANNEL_LIMIT = 80;
const DESKTOP_CHANNEL_LIMIT = 200;

export default function HomePage() {
  const { isPinned, togglePin, pinned: pinnedIds } = usePinnedChannels();

  const {
    channels, allChannels, loading, error,
    search, setSearch,
    category, setCategory,
    showOnlineOnly, setShowOnlineOnly,
    updateStatus, reload,
  } = useChannels(pinnedIds);

  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Default to Bangladesh category on mobile for a shorter initial list
  useEffect(() => {
    if (isMobile && category === 'all') setCategory('bangladesh');
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stream checker disabled on mobile — too CPU/RAM intensive for low-end devices
  useStreamChecker(allChannels, updateStatus, !isMobile);

  const liveCount = allChannels.filter((c) => c.status === 'online').length;

  function handleSelect(ch: Channel) {
    setActiveChannel(ch);
    if (isMobile) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Reset "show more" whenever the filter changes so we don't show excess channels
  useEffect(() => { setShowMore(false); }, [category, search, showOnlineOnly]);

  const limit = isMobile ? MOBILE_CHANNEL_LIMIT : DESKTOP_CHANNEL_LIMIT;
  const visibleChannels = showMore ? channels : channels.slice(0, limit);
  const hasMore = channels.length > limit && !showMore;

  return (
    <div className="flex flex-col overflow-hidden h-full" style={{ background: 'var(--bg-0)' }}>
      <Header search={search} onSearch={setSearch} liveCount={liveCount} />

      {/*
        ONE content row: sidebar (desktop-only) + main area (always mounted).
        The player lives exclusively inside the main area — rendered exactly once.
        Never duplicate <HLSPlayer> in a second branch; CSS display:none does NOT
        unmount React components, so both HLS.js instances would stream audio.
      */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar: desktop only (hidden lg:flex) ─────────── */}
        <aside
          className="hidden lg:flex flex-col shrink-0 overflow-hidden"
          style={{
            width: 'var(--sidebar-w)',
            borderRight: '1px solid var(--glass-border)',
            background: 'var(--bg-1)',
          }}
        >
          <Sidebar
            channels={visibleChannels}
            allChannels={allChannels}
            loading={loading}
            error={error}
            category={category}
            onCategory={setCategory}
            showOnlineOnly={showOnlineOnly}
            onToggleOnlineOnly={() => setShowOnlineOnly((v) => !v)}
            activeId={activeChannel?.id ?? null}
            onSelect={handleSelect}
            onReload={reload}
            hasMore={hasMore}
            onShowMore={() => setShowMore(true)}
            isPinned={isPinned}
            onTogglePin={togglePin}
          />
        </aside>

        {/* ── Main area: always mounted, single scroll column ── */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">

          {/* Player — THE ONLY HLSPlayer INSTANCE IN THE TREE */}
          <div className="p-3 sm:p-4 lg:p-5 xl:p-7">
            <div className="w-full max-w-4xl lg:mx-auto">
              {activeChannel
                ? <HLSPlayer channel={activeChannel} />
                : <PlayerPlaceholder />
              }
              {activeChannel && (
                <div className="fade-up" style={{ marginTop: 10 }}>
                  <NowPlayingBar channel={activeChannel} />
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile channel browser: visible only below lg ── */}
          <div className="lg:hidden flex flex-col">

            {/* Sticky category pills */}
            <div
              className="sticky z-30"
              style={{
                top: 0,
                background: 'rgba(5,5,8,0.97)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <CategoryFilter
                active={category}
                onChange={setCategory}
                showOnlineOnly={showOnlineOnly}
                onToggleOnlineOnly={() => setShowOnlineOnly((v) => !v)}
                layout="horizontal"
              />
            </div>

            {/* Stats + refresh */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderBottom: '1px solid var(--glass-border)' }}
            >
              {loading ? (
                <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Loading…</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="live-dot"
                    style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--online)', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-1)' }}>
                    <strong style={{ color: 'var(--online)', fontWeight: 700 }}>{liveCount}</strong>
                    {' live · '}
                    <span style={{ color: 'var(--text-2)' }}>{channels.length} shown</span>
                  </span>
                </div>
              )}
              <button
                onClick={reload}
                disabled={loading}
                className="btn-glass flex items-center gap-1.5"
                style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600 }}
              >
                <RefreshCw size={10} className={loading ? 'spin' : ''} />
                Refresh
              </button>
            </div>

            {/* Channel cards */}
            <div>
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="skeleton flex items-center gap-3" style={{ padding: '10px 12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.03)' }} />
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div style={{ height: 9, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '62%' }} />
                        <div style={{ height: 7, background: 'rgba(255,255,255,0.03)', borderRadius: 4, width: '38%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && !loading && (
                <div className="p-8 text-center">
                  <p style={{ fontSize: 13, color: 'var(--text-1)', marginBottom: 12 }}>{error}</p>
                  <button
                    onClick={reload}
                    style={{ padding: '9px 20px', fontSize: 12, fontWeight: 700, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-sm)', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && channels.length === 0 && (
                <div className="py-16 flex flex-col items-center gap-3">
                  <Tv2 size={26} style={{ color: 'var(--text-2)' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-2)' }}>No channels match this filter</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {!loading && !error && visibleChannels.map((ch) => (
                  <ChannelCard
                    key={ch.id}
                    channel={ch}
                    isActive={ch.id === activeChannel?.id}
                    isPinned={isPinned(ch.id)}
                    onTogglePin={() => togglePin(ch.id)}
                    onClick={() => handleSelect(ch)}
                  />
                ))}
              </div>

              {hasMore && !loading && !error && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => setShowMore(true)}
                    className="btn-glass"
                    style={{ padding: '8px 20px', fontSize: 12, fontWeight: 600 }}
                  >
                    Show {channels.length - limit} more channels
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* ── end mobile channel browser ── */}

          <Footer />
        </div>
        {/* ── end main area ── */}

      </div>
    </div>
  );
}

/* ── Now Playing bar ──────────────────────────── */
function NowPlayingBar({ channel }: { channel: Channel }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div className="flex items-center justify-between gap-4" style={{ padding: '10px 14px' }}>
        <div className="min-w-0">
          <div
            className="truncate"
            style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', letterSpacing: '-0.01em' }}
          >
            {channel.name}
          </div>
          <div
            className="truncate"
            style={{ fontSize: 11, color: 'var(--text-1)', marginTop: 2 }}
          >
            {channel.group}{channel.country ? ` · ${channel.country}` : ''}
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 shrink-0"
          style={{ padding: '4px 10px', background: 'var(--live-bg)', border: '1px solid var(--live-border)', borderRadius: 6 }}
        >
          <span
            className="live-dot"
            style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--live)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--live)' }}>
            LIVE NOW
          </span>
        </div>
      </div>
      <div
        className="hidden sm:flex items-center gap-4"
        style={{ padding: '5px 14px', borderTop: '1px solid var(--glass-border)' }}
      >
        {[['Space', 'Play/Pause'], ['M', 'Mute'], ['F', 'Fullscreen'], ['↑↓', 'Volume']].map(([k, l]) => (
          <span key={k} className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--text-2)' }}>
            <kbd style={{ padding: '1px 5px', fontSize: 10, fontFamily: 'monospace', background: 'var(--glass)', border: '1px solid var(--glass-strong)', borderRadius: 3, color: 'var(--text-1)' }}>
              {k}
            </kbd>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
