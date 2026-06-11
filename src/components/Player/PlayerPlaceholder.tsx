'use client';

import { Tv2 } from 'lucide-react';

const TAGS = [
  { label: 'Cricket', color: '#34c759' },
  { label: 'Football', color: '#0a84ff' },
  { label: 'UFC', color: '#ff375f' },
  { label: 'BD TV', color: '#ff9500' },
  { label: 'English TV', color: '#bf5af2' },
];

export default function PlayerPlaceholder() {
  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center select-none"
      style={{
        aspectRatio: '16/9',
        borderRadius: 'var(--radius-md)',
        background: [
          'radial-gradient(ellipse at 25% 35%, rgba(255,77,0,0.08) 0%, transparent 55%)',
          'radial-gradient(ellipse at 75% 70%, rgba(255,149,0,0.05) 0%, transparent 50%)',
          '#060610',
        ].join(', '),
        border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
        }}
      />

      {/* Radial fade over grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6,6,16,0.6) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 text-center">
        {/* Icon with glow + ping */}
        <div className="relative">
          <div
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(255,77,0,0.14), rgba(255,149,0,0.07))',
              borderRadius: 16,
              border: '1px solid rgba(255,77,0,0.18)',
              boxShadow: '0 0 32px rgba(255,77,0,0.10)',
            }}
          >
            <Tv2 size={30} style={{ color: 'var(--accent)' }} />
          </div>
          <div
            className="ping-ring absolute inset-0"
            style={{ borderRadius: 16, border: '1px solid rgba(255,77,0,0.25)' }}
          />
        </div>

        {/* Text */}
        <div>
          <h2
            className="font-bold"
            style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--text-0)', letterSpacing: '-0.02em' }}
          >
            Pick a channel to watch
          </h2>
          <p
            className="mt-1.5"
            style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'var(--text-1)' }}
          >
            Free live sports, cricket, football, UFC &amp; more — no sign‑up
          </p>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {TAGS.map((tag) => (
            <span
              key={tag.label}
              style={{
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 600,
                background: `${tag.color}14`,
                border: `1px solid ${tag.color}28`,
                borderRadius: 'var(--radius-sm)',
                color: tag.color,
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
