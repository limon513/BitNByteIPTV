'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Channel } from '@/types/channel';

const BATCH_SIZE = 4;
const TIMEOUT_MS = 6000;

async function probeStream(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout>;

    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) {
        const video = document.createElement('video');
        video.muted = true;
        timer = setTimeout(() => { video.src = ''; resolve(false); }, TIMEOUT_MS);
        video.addEventListener('loadedmetadata', () => { clearTimeout(timer); video.src = ''; resolve(true); });
        video.addEventListener('error', () => { clearTimeout(timer); resolve(false); });
        video.src = url;
        return;
      }

      const hls = new Hls({ debug: false, enableWorker: false, maxBufferLength: 1, maxMaxBufferLength: 1 });
      const video = document.createElement('video');
      video.muted = true;

      timer = setTimeout(() => { hls.destroy(); resolve(false); }, TIMEOUT_MS);

      hls.on(Hls.Events.MANIFEST_PARSED, () => { clearTimeout(timer); hls.destroy(); resolve(true); });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) { clearTimeout(timer); hls.destroy(); resolve(false); }
      });

      hls.loadSource(url);
      hls.attachMedia(video);
    }).catch(() => resolve(false));
  });
}

export function useStreamChecker(
  channels: Channel[],
  onStatus: (id: string, status: Channel['status']) => void,
  enabled = true,
) {
  const queueRef = useRef<Channel[]>([]);
  const runningRef = useRef(0);
  const abortRef = useRef(false);

  const processNext = useCallback(async () => {
    if (abortRef.current) return;
    const ch = queueRef.current.shift();
    if (!ch) return;

    runningRef.current++;
    onStatus(ch.id, 'checking');

    try {
      const ok = await probeStream(ch.url);
      if (!abortRef.current) onStatus(ch.id, ok ? 'online' : 'offline');
    } catch {
      if (!abortRef.current) onStatus(ch.id, 'offline');
    } finally {
      runningRef.current--;
      if (!abortRef.current) processNext();
    }
  }, [onStatus]);

  useEffect(() => {
    if (!enabled) return;

    abortRef.current = false;
    queueRef.current = [...channels];
    runningRef.current = 0;

    const initial = Math.min(BATCH_SIZE, channels.length);
    for (let i = 0; i < initial; i++) processNext();

    return () => {
      abortRef.current = true;
      queueRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, channels.map((c) => c.id).join(',')]);
}
