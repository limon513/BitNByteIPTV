'use client';

import { useState } from 'react';
import { Search, X, Radio } from 'lucide-react';
import Image from 'next/image';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  liveCount?: number;
}

export default function Header({ search, onSearch, liveCount }: Props) {
  const [focused, setFocused] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header
      style={{
        height: 'var(--header-h)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 12px',
        background: 'rgba(5,5,8,0.95)',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <a
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          textDecoration: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!logoError ? (
            <Image
              /* Try real PNG first; if user hasn't placed it, falls back to SVG */
              src="/logo.png"
              alt="BitNByte TV"
              width={34}
              height={34}
              unoptimized
              priority
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              onError={(e) => {
                /* Swap to SVG fallback instead of hiding */
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.endsWith('/logo.svg')) {
                  img.src = '/logo.svg';
                } else {
                  setLogoError(true);
                }
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <Radio size={16} color="white" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Text: hidden on very small screens */}
        <div className="hidden xs:flex sm:flex items-baseline gap-0.5" style={{ display: 'flex' }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-0)',
              letterSpacing: '-0.02em',
            }}
          >
            BitNByte
          </span>
          <span
            className="text-gradient"
            style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.02em' }}
          >
            TV
          </span>
        </div>
      </a>

      {/* Search bar */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: `1.5px solid ${focused || search ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
          paddingBottom: 1,
          transition: 'border-color 0.2s',
          maxWidth: 360,
        }}
      >
        <Search
          size={12}
          style={{
            color: focused || search ? 'var(--accent)' : 'var(--text-2)',
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-0)',
            fontSize: 12,
            padding: '7px 0',
          }}
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            style={{ color: 'var(--text-2)', flexShrink: 0, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Live count — visible on sm+ */}
        {liveCount !== undefined && liveCount > 0 && (
          <span
            className="hidden sm:inline"
            style={{ fontSize: 11, fontWeight: 600, color: 'var(--online)' }}
          >
            {liveCount} live
          </span>
        )}

        {/* LIVE badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 8px',
            background: 'var(--live-bg)',
            border: '1px solid var(--live-border)',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
          }}
        >
          <span
            className="live-dot"
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--live)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'var(--live)',
            }}
          >
            LIVE
          </span>
        </div>
      </div>
    </header>
  );
}
