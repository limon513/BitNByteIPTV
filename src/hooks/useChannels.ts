'use client';

import { useState, useEffect, useCallback } from 'react';
import { Channel, CategoryId } from '@/types/channel';
import { parseM3U, deduplicateChannels } from '@/lib/m3u-parser';
import { SourceKey } from '@/lib/sources';
import { CATEGORY_KEYWORDS } from '@/lib/sources';

const SOURCES: SourceKey[] = ['bangladesh', 'sports', 'india', 'pakistan'];

async function fetchPlaylist(source: SourceKey): Promise<Channel[]> {
  const res = await fetch(`/api/channels?source=${source}`);
  if (!res.ok) return [];
  const text = await res.text();
  const countryMap: Record<SourceKey, string> = {
    bangladesh: 'BD',
    sports: '',
    india: 'IN',
    pakistan: 'PK',
  };
  return parseM3U(text, countryMap[source]);
}

function matchesCategory(ch: Channel, category: CategoryId): boolean {
  if (category === 'all') return true;
  const haystack = `${ch.name} ${ch.group}`.toLowerCase();
  if (category === 'bangladesh') return ch.country === 'BD';
  const keywords = CATEGORY_KEYWORDS[category];
  if (keywords) return keywords.some((kw) => haystack.includes(kw));
  return false;
}

export function useChannels() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryId>('all');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(SOURCES.map(fetchPlaylist));
      const merged: Channel[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled') merged.push(...r.value);
      }
      setAllChannels(deduplicateChannels(merged));
    } catch {
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const updateStatus = useCallback((id: string, status: Channel['status']) => {
    setAllChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, status } : ch))
    );
  }, []);

  const filtered = allChannels.filter((ch) => {
    if (showOnlineOnly && ch.status === 'offline') return false;
    if (search) {
      const q = search.toLowerCase();
      if (!ch.name.toLowerCase().includes(q) && !ch.group.toLowerCase().includes(q)) return false;
    }
    return matchesCategory(ch, category);
  });

  return {
    channels: filtered,
    allChannels,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    showOnlineOnly,
    setShowOnlineOnly,
    updateStatus,
    reload: loadChannels,
  };
}
