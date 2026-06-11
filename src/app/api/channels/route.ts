import { NextRequest, NextResponse } from 'next/server';
import { M3U_SOURCES, SourceKey } from '@/lib/sources';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get('source') as SourceKey | null;

  if (!source || !(source in M3U_SOURCES)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const url = M3U_SOURCES[source];

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BitNByte-TV/1.0)',
      },
      // Cloudflare edge cache — tells CF to cache this at the edge for 1 hour
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(typeof (globalThis as any).caches !== 'undefined'
        ? { cf: { cacheTtl: 3600, cacheEverything: true } }
        : {}),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    const text = await res.text();

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[channels] fetch error:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
