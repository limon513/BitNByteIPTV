export const M3U_SOURCES = {
  bangladesh: 'https://iptv-org.github.io/iptv/countries/bd.m3u',
  sports: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
  india: 'https://iptv-org.github.io/iptv/countries/in.m3u',
  pakistan: 'https://iptv-org.github.io/iptv/countries/pk.m3u',
} as const;

export type SourceKey = keyof typeof M3U_SOURCES;

// Keyword lists for category detection
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cricket: ['cricket', 't sports', 'tsports', 'star sports', 'starsports', 'sony sports', 'sonysports', 'ten sports', 'tensports', 'willow', 'dd sports', 'geo super', 'ptv sports'],
  football: ['football', 'soccer', 'premier league', 'epl', 'laliga', 'bundesliga', 'champions league', 'serie a', 'ligue 1', 'beinsports', 'bein sports'],
  ufc: ['ufc', 'mma', 'fight', 'boxing', 'combat', 'espn', 'espn+'],
  sports: ['sports', 'sport', 't sports', 'tsports', 'espn', 'fox sports', 'eurosport', 'supersport', 'dsports', 'd sports', 'star sports', 'sky sports'],
  news: ['news', 'cnn', 'bbc', 'aljazeera', 'al jazeera', 'ndtv', 'zee news', 'channel 24', 'somoy', 'ekhon tv'],
  entertainment: ['entertainment', 'zee', 'sony', 'star plus', 'colors', 'channel i', 'atv', 'maasranga', 'nrb'],
  music: ['music', 'mtv', 'vh1', 'channel v', 'music asia'],
};

// Hardcoded pinned channels — always available regardless of iptv-org playlist state
export const PINNED_CHANNELS = [
  {
    id: 'tsports-hd-pinned',
    name: 'T Sports HD',
    logo: 'https://i.imgur.com/2JzlorD.png',
    url: 'https://tvsen7.aynaott.com/tsports-hd/index.m3u8',
    group: 'Sports',
    country: 'BD',
    tvgId: 'TSports.bd@HD',
    status: 'unknown' as const,
  },
  {
    id: 'star-sports-1-pinned',
    name: 'Star Sports 1',
    logo: 'https://i.imgur.com/E5jjKHI.png',
    url: 'https://tvsen7.aynaott.com/sspts1/index.m3u8',
    group: 'Sports',
    country: 'IN',
    tvgId: 'StarSports1.in@SD',
    status: 'unknown' as const,
  },
  {
    id: 'star-sports-2-pinned',
    name: 'Star Sports 2 HD',
    logo: 'https://i.imgur.com/kHerF19.png',
    url: 'https://tvsen7.aynaott.com/ssport2hd/index.m3u8',
    group: 'Sports',
    country: 'IN',
    tvgId: 'StarSports2.in@HD',
    status: 'unknown' as const,
  },
];
