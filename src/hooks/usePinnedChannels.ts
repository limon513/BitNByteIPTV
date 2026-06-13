'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'bitnbyte_pinned_channels';

function loadPinned(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function savePinned(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* storage full or unavailable */ }
}

export function usePinnedChannels() {
  const [pinned, setPinned] = useState<Set<string>>(() => loadPinned());

  useEffect(() => { savePinned(pinned); }, [pinned]);

  const togglePin = useCallback((id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isPinned = useCallback((id: string) => pinned.has(id), [pinned]);

  return { pinned, togglePin, isPinned };
}
