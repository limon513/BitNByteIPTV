import { Channel } from '@/types/channel';

export function parseM3U(content: string, defaultCountry = ''): Channel[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const channels: Channel[] = [];
  let meta: Partial<Channel> | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const name =
        line.match(/tvg-name="([^"]+)"/)?.[1] ||
        line.match(/,(.+)$/)?.[1]?.trim() ||
        'Unknown Channel';
      const logo = line.match(/tvg-logo="([^"]+)"/)?.[1] || '';
      const group = line.match(/group-title="([^"]+)"/)?.[1] || 'General';
      const tvgId = line.match(/tvg-id="([^"]+)"/)?.[1] || '';
      const country = line.match(/tvg-country="([^"]+)"/)?.[1] || defaultCountry;

      meta = { name, logo, group, tvgId, country };
    } else if (line.startsWith('http') && meta) {
      const id = `${meta.tvgId || meta.name}-${Math.random().toString(36).slice(2, 7)}`;
      channels.push({
        id,
        name: meta.name!,
        logo: meta.logo!,
        url: line,
        group: meta.group!,
        country: meta.country!,
        tvgId: meta.tvgId!,
        status: 'unknown',
      });
      meta = null;
    }
  }

  return channels;
}

export function deduplicateChannels(channels: Channel[]): Channel[] {
  const seen = new Set<string>();
  return channels.filter((ch) => {
    const key = ch.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
