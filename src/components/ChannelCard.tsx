'use client';

import { Channel } from '@/types/channel';
import Image from 'next/image';

interface Props {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}

export default function ChannelCard({ channel, isActive, onClick }: Props) {
  const isLive     = channel.status === 'online';
  const isChecking = channel.status === 'checking';
  const isOffline  = channel.status === 'offline';

  return (
    <button
      onClick={onClick}
      disabled={isOffline}
      className="w-full flex items-center gap-3 text-left transition-all duration-150"
      style={{
        padding: '10px 12px',
        background: isActive ? 'var(--bg-active)' : 'transparent',
        borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
        borderRight: '2px solid transparent',
        opacity: isOffline ? 0.30 : 1,
        cursor: isOffline ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isOffline) {
          e.currentTarget.style.background = 'var(--bg-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Logo */}
      <div
        className="shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          width: 40,
          height: 40,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--glass-border)',
          borderRadius: 8,
        }}
      >
        {channel.logo ? (
          <Image
            src={channel.logo}
            alt={channel.name}
            width={40}
            height={40}
            unoptimized
            className="object-contain w-full h-full p-1"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>TV</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="truncate font-semibold"
          style={{
            fontSize: 12,
            lineHeight: 1.35,
            color: isActive ? 'var(--text-0)' : 'rgba(242,242,247,0.82)',
          }}
        >
          {channel.name}
        </div>
        <div
          className="truncate mt-0.5"
          style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.3 }}
        >
          {channel.group}{channel.country ? ` · ${channel.country}` : ''}
        </div>
      </div>

      {/* Status badge */}
      <div className="shrink-0 flex items-center">
        {isLive && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5"
            style={{
              background: 'var(--live-bg)',
              border: '1px solid var(--live-border)',
              borderRadius: 4,
            }}
          >
            <span
              className="live-dot w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--live)' }}
            />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--live)' }}>
              LIVE
            </span>
          </div>
        )}
        {isChecking && (
          <div
            className="spin w-3.5 h-3.5 rounded-full"
            style={{
              border: '1.5px solid var(--text-3)',
              borderTopColor: 'var(--text-2)',
            }}
          />
        )}
      </div>
    </button>
  );
}
