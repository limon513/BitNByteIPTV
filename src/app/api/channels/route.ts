import { NextResponse } from 'next/server';
import { M3U_SOURCES, SourceKey } from '@/lib/sources';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    /* Use native URL — more compatible with Cloudflare Workers than req.nextUrl */
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source') as SourceKey | null;

    if (!source || !(source in M3U_SOURCES)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    const upstream = M3U_SOURCES[source];

    const res = await fetch(upstream, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BitNByte-TV/1.0)' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error ${res.status}` },
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
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[channels]', detail);
    return NextResponse.json({ error: 'Fetch failed', detail }, { status: 500 });
  }
}
