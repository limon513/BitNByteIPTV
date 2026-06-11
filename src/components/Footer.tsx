'use client';

import { Globe, Mail, Radio } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  const [logoError, setLogoError] = useState(false);

  return (
    <footer
      className="shrink-0 w-full mt-auto"
      style={{ borderTop: '1px solid var(--glass-border)', background: 'var(--bg-1)' }}
    >
      {/* Accent top line */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 25%, var(--accent-2) 75%, transparent 100%)',
        }}
      />

      <div className="max-w-5xl mx-auto px-5 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex items-center justify-center overflow-hidden shrink-0"
                style={{ width: 36, height: 36, borderRadius: 8 }}
              >
                {!logoError ? (
                  <Image
                    src="/logo.png"
                    alt="BitNByte TV"
                    width={36}
                    height={36}
                    unoptimized
                    className="object-contain"
                    onError={(e) => {
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
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <Radio size={16} color="white" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold" style={{ fontSize: 14, color: 'var(--text-0)' }}>BitNByte</span>
                <span className="font-black text-gradient" style={{ fontSize: 14 }}>TV</span>
              </div>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-1)', maxWidth: 230 }}>
              Free live sports and TV streaming. Watch cricket, football, UFC, Bangladesh &amp; English channels — all free.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4
              className="font-bold uppercase tracking-widest mb-3"
              style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.1em' }}
            >
              Categories
            </h4>
            <ul className="space-y-2">
              {['Sports & Cricket', 'Football & UFC', 'Bangladesh TV', 'English Channels', 'News & Entertainment'].map((item) => (
                <li key={item}>
                  <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4
              className="font-bold uppercase tracking-widest mb-3"
              style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.1em' }}
            >
              About
            </h4>
            <p className="mb-4" style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.6 }}>
              A product by{' '}
              <span style={{ fontWeight: 700, color: 'var(--text-0)' }}>BitNByte IT</span>
              {' '}— Software, Web, Mobile &amp; AI Solutions.
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://bitnbyteit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors"
                style={{ fontSize: 12, color: 'var(--text-1)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
              >
                <Globe size={13} style={{ flexShrink: 0 }} />
                bitnbyteit.com
              </a>
              <a
                href="mailto:bitnbyteit1@gmail.com"
                className="flex items-center gap-2 transition-colors"
                style={{ fontSize: 12, color: 'var(--text-1)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
              >
                <Mail size={13} style={{ flexShrink: 0 }} />
                bitnbyteit1@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-8 pt-5"
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
            © {year} BitNByte IT. All rights reserved.
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-2)', maxWidth: 440, lineHeight: 1.5 }}>
            This site aggregates publicly available free IPTV streams. We do not host any video content.
          </p>
        </div>
      </div>
    </footer>
  );
}
