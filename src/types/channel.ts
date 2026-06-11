export type StreamStatus = 'checking' | 'online' | 'offline' | 'unknown';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  group: string;
  country: string;
  tvgId: string;
  status: StreamStatus;
}

export type CategoryId =
  | 'all'
  | 'sports'
  | 'cricket'
  | 'football'
  | 'ufc'
  | 'bangladesh'
  | 'news'
  | 'entertainment'
  | 'music'
  | 'general';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}
