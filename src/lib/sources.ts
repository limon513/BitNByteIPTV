export const M3U_SOURCES = {
  bangladesh: 'https://iptv-org.github.io/iptv/countries/bd.m3u',
  sports: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
  india: 'https://iptv-org.github.io/iptv/countries/in.m3u',
  pakistan: 'https://iptv-org.github.io/iptv/countries/pk.m3u',
} as const;

export type SourceKey = keyof typeof M3U_SOURCES;

// Keyword lists for category detection
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cricket: ['cricket', 'star sports', 'starsports', 'sony sports', 'sonysports', 'ten sports', 'tensports', 'willow', 'dd sports', 'geo super', 'ptv sports'],
  football: ['football', 'soccer', 'premier league', 'epl', 'laliga', 'bundesliga', 'champions league', 'serie a', 'ligue 1', 'beinsports', 'bein sports'],
  ufc: ['ufc', 'mma', 'fight', 'boxing', 'combat', 'espn', 'espn+'],
  sports: ['sports', 'sport', 'espn', 'fox sports', 'eurosport', 'supersport', 'supersport', 'dsports', 'd sports', 'star sports', 'sky sports'],
  news: ['news', 'cnn', 'bbc', 'aljazeera', 'al jazeera', 'ndtv', 'zee news', 'channel 24', 'somoy', 'ekhon tv'],
  entertainment: ['entertainment', 'zee', 'sony', 'star plus', 'colors', 'channel i', 'atv', 'maasranga', 'nrb'],
  music: ['music', 'mtv', 'vh1', 'channel v', 'music asia'],
};
