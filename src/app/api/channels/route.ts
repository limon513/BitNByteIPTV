import { NextRequest, NextResponse } from 'next/server';
import { M3U_SOURCES, SourceKey } from '@/lib/sources';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get('source') as SourceKey | null;

  if (!source || !(source in M3U_SOURCES)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const url = M3U_SOURCES[source];

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    const text = await res.text();

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
