'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  PictureInPicture2, RotateCcw, Settings, WifiOff,
} from 'lucide-react';
import { Channel } from '@/types/channel';
import Image from 'next/image';

interface Props { channel: Channel }
type PlayerState = 'loading' | 'playing' | 'paused' | 'error';

/* ── Signal Equalizer ───────────────────────────── */
const EQ_DELAYS = [0, 0.15, 0.05, 0.2, 0.1, 0.08, 0.18];
function SignalLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }} aria-label="Loading">
      {EQ_DELAYS.map((delay, i) => (
        <div key={i} style={{
          width: 3, height: '100%',
          background: 'linear-gradient(to top, var(--accent), var(--accent-2))',
          borderRadius: 2, transformOrigin: 'bottom',
          animation: `eq-bar 0.75s ease-in-out ${delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function HLSPlayer({ channel }: Props) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef       = useRef<import('hls.js').default | null>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state,        setState]        = useState<PlayerState>('loading');
  const [volume,       setVolume]       = useState(1);
  const [muted,        setMuted]        = useState(false);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [showCtrls,    setShowCtrls]    = useState(true);
  const [levels,       setLevels]       = useState<{ height: number; bitrate: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showQuality,  setShowQuality]  = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  /* Sync muted via ref — React JSX muted prop has known browser sync issues */
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowCtrls(false), 3500);
  }, []);

  const revealCtrls = useCallback(() => {
    setShowCtrls(true);
    scheduleHide();
  }, [scheduleHide]);

  const destroyHls = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
  }, []);

  const loadStream = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !channel.url) return;
    destroyHls();
    setState('loading');
    setErrorMsg('');
    setLevels([]);
    setCurrentLevel(-1);

    const { default: Hls } = await import('hls.js');

    if (Hls.isSupported()) {
      const mobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      const hls = new Hls({
        debug: false,
        enableWorker: !mobile,
        lowLatencyMode: !mobile,
        maxBufferLength: mobile ? 10 : 30,
        maxMaxBufferLength: mobile ? 20 : 60,
        maxBufferSize: mobile ? 10 * 1000 * 1000 : 60 * 1000 * 1000,
      });
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        setLevels(data.levels.map((l) => ({ height: l.height, bitrate: l.bitrate })));
        video.play().then(() => setState('playing')).catch(() => setState('paused'));
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => setCurrentLevel(data.level));
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setState('error');
          setErrorMsg(data.type === 'networkError' ? 'Stream unreachable' : 'Playback failed');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      /* Safari native HLS */
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        video.play().then(() => setState('playing')).catch(() => setState('paused'));
      }, { once: true });
      video.addEventListener('error', () => {
        setState('error'); setErrorMsg('Stream unavailable');
      }, { once: true });
    } else {
      setState('error'); setErrorMsg('HLS not supported in this browser');
    }
  }, [channel.url, destroyHls]);

  useEffect(() => { loadStream(); return destroyHls; }, [loadStream, destroyHls]);

  /* Video element events */
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const onWaiting = () => setState('loading');
    const onPlaying = () => setState('playing');
    const onPause   = () => setState('paused');
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('pause',   onPause);
    return () => {
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('pause',   onPause);
    };
  }, []);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space')     { e.preventDefault(); togglePlay(); }
      if (e.code === 'KeyM')      toggleMute();
      if (e.code === 'KeyF')      toggleFullscreen();
      if (e.code === 'ArrowUp')   { e.preventDefault(); adjustVol(0.1); }
      if (e.code === 'ArrowDown') { e.preventDefault(); adjustVol(-0.1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  /* Fullscreen change listener */
  useEffect(() => {
    const onFS = () => setFullscreen(
      !!document.fullscreenElement || !!(document as any).webkitFullscreenElement
    );
    document.addEventListener('fullscreenchange', onFS);
    document.addEventListener('webkitfullscreenchange', onFS);
    return () => {
      document.removeEventListener('fullscreenchange', onFS);
      document.removeEventListener('webkitfullscreenchange', onFS);
    };
  }, []);

  /* ── Actions ─────────────────────────────────── */
  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setState('playing'); }
    else { v.pause(); setState('paused'); }
  };

  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
  };

  const adjustVol = (d: number) => {
    const v = videoRef.current; if (!v) return;
    const nv = Math.max(0, Math.min(1, v.volume + d));
    v.volume = nv; setVolume(nv);
    if (nv > 0 && v.muted) { v.muted = false; setMuted(false); }
  };

  const handleVol = (val: number) => {
    const v = videoRef.current; if (!v) return;
    v.volume = val; setVolume(val);
    if (val === 0) { v.muted = true;  setMuted(true); }
    else           { v.muted = false; setMuted(false); }
  };

  /* Fullscreen: handles desktop + Android + iOS Safari + landscape lock */
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    const isFs = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;

    if (!isFs) {
      try {
        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any)?.webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        } else if (video && (video as any).webkitEnterFullscreen) {
          /* iOS Safari — enters fullscreen natively + auto-rotates */
          (video as any).webkitEnterFullscreen();
          return;
        }
        /* Lock landscape orientation on mobile (works on Android Chrome) */
        try {
          if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
            await (screen.orientation as any).lock('landscape');
          }
        } catch { /* not supported on this platform */ }
      } catch {
        /* Fallback for iOS when container.requestFullscreen fails */
        if (video && (video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
      try {
        if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
          (screen.orientation as any).unlock();
        }
      } catch { /* ignore */ }
    }
  };

  const togglePiP = async () => {
    const v = videoRef.current; if (!v) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await v.requestPictureInPicture().catch(() => {});
  };

  const setQuality = (level: number) => {
    if (hlsRef.current) { hlsRef.current.currentLevel = level; setCurrentLevel(level); }
    setShowQuality(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        background: '#000',
        borderRadius: fullscreen ? 0 : 'var(--radius-md)',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: showCtrls || state !== 'playing' ? 'default' : 'none',
        boxShadow: fullscreen ? 'none' : '0 0 0 1px rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.8)',
      }}
      onMouseMove={revealCtrls}
      onMouseLeave={() => state === 'playing' && setShowCtrls(false)}
      onTouchStart={revealCtrls}
    >
      {/* Video element — no muted JSX prop (managed via ref) */}
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        autoPlay
        playsInline
      />

      {/* ── Top gradient: channel info (pointer-events: none — never blocks clicks) */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px 40px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.80) 0%, transparent 100%)',
          opacity: showCtrls ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      >
        {channel.logo && (
          <div style={{ width: 34, height: 34, borderRadius: 6, overflow: 'hidden', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src={channel.logo} alt={channel.name} width={34} height={34} unoptimized className="object-contain p-0.5" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channel.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{channel.group}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'var(--live-bg)', border: '1px solid var(--live-border)', borderRadius: 4, flexShrink: 0 }}>
          <span className="live-dot" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--live)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--live)' }}>LIVE</span>
        </div>
      </div>

      {/* ── Loading indicator (pointer-events: none) */}
      {state === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, pointerEvents: 'none', zIndex: 3 }}>
          <SignalLoader />
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Connecting…</span>
        </div>
      )}

      {/* ── Paused icon (pointer-events: none) */}
      {state === 'paused' && showCtrls && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 3 }}>
          <div style={{ width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
            <Play size={24} fill="white" color="white" />
          </div>
        </div>
      )}

      {/* ── Error state (pointer-events: auto — for retry button) */}
      {state === 'error' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 32px', zIndex: 5 }}>
          <div style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,55,95,0.12)', borderRadius: 10, border: '1px solid rgba(255,55,95,0.2)' }}>
            <WifiOff size={22} style={{ color: 'var(--live)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)' }}>{errorMsg || 'Stream unavailable'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 4 }}>May be offline or geo‑restricted</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); loadStream(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', fontSize: 12, fontWeight: 700, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-sm)', color: '#fff', boxShadow: '0 4px 14px var(--accent-glow)', border: 'none', cursor: 'pointer' }}
          >
            <RotateCcw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          CLICK INTERCEPTOR — z-index 1
          Handles single-click (play/pause) and double-click (fullscreen)
          Sits BELOW controls so control buttons remain clickable
          ══════════════════════════════════════════════════════════ */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        onClick={() => { if (state !== 'error' && state !== 'loading') togglePlay(); }}
        onDoubleClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
      />

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CONTROLS — z-index 2 (ABOVE click interceptor)
          Each button calls e.stopPropagation() so clicks don't
          bubble down to the click interceptor
          ══════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', gap: 6,
          padding: '40px 12px 10px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.94) 0%, transparent 100%)',
          opacity: showCtrls ? 1 : 0,
          pointerEvents: showCtrls ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          zIndex: 2,
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {/* Live progress strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', width: state === 'playing' ? '100%' : '0%', background: 'var(--accent-gradient)', boxShadow: '0 0 6px var(--accent)', transition: 'width 0.6s linear' }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--live)', letterSpacing: '0.05em', flexShrink: 0 }}>● LIVE</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Btn onClick={togglePlay} title={state === 'playing' ? 'Pause' : 'Play'}>
            {state === 'playing'
              ? <Pause size={15} fill="white" color="white" />
              : <Play  size={15} fill="white" color="white" />
            }
          </Btn>

          <Btn onClick={loadStream} title="Reload">
            <RotateCcw size={13} />
          </Btn>

          <Btn onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
            {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </Btn>

          {/* Volume slider */}
          <div
            style={{ width: 56, margin: '0 4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="range"
              className="vol"
              style={{ width: '100%' }}
              min={0} max={1} step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => handleVol(parseFloat(e.target.value))}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Quality selector */}
          {levels.length > 1 && (
            <div style={{ position: 'relative' }}>
              <Btn onClick={() => setShowQuality((v) => !v)} title="Quality">
                <Settings size={13} />
              </Btn>
              {showQuality && (
                <div
                  style={{
                    position: 'absolute', bottom: 44, right: 0, width: 112, paddingTop: 6, paddingBottom: 6,
                    background: 'rgba(8,8,14,0.97)', border: '1px solid var(--glass-strong)',
                    borderRadius: 8, backdropFilter: 'blur(20px)', boxShadow: '0 16px 40px rgba(0,0,0,0.7)', zIndex: 10,
                  }}
                >
                  <div style={{ padding: '0 12px 6px', fontSize: 9, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Quality
                  </div>
                  {[
                    { idx: -1, label: 'Auto' },
                    ...levels.map((l, i) => ({
                      idx: i,
                      label: l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)}k`,
                    })),
                  ].map((l) => (
                    <button
                      key={l.idx}
                      onClick={(e) => { e.stopPropagation(); setQuality(l.idx); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 12px', fontSize: 12, border: 'none', cursor: 'pointer',
                        color: currentLevel === l.idx ? 'var(--accent)' : 'var(--text-0)',
                        background: currentLevel === l.idx ? 'var(--bg-active)' : 'transparent',
                      }}
                    >
                      {l.label}
                      {currentLevel === l.idx && <span style={{ color: 'var(--accent)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Btn onClick={togglePiP} title="Picture in Picture">
            <PictureInPicture2 size={13} />
          </Btn>

          <Btn onClick={toggleFullscreen} title="Fullscreen">
            {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Control button ─────────────────────────────── */
function Btn({
  children, onClick, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.70)',
        borderRadius: 6,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'color 0.1s, background 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgba(255,255,255,0.70)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}
