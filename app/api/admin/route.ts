import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { briefs, visitors } from '@/drizzle/schema';
import { desc } from 'drizzle-orm';
import { env } from '@/lib/env';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  
  if (key !== env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const [recentBriefs, recentVisitors, stats] = await Promise.all([
    db.select().from(briefs).orderBy(desc(briefs.createdAt)).limit(50),
    db.select().from(visitors).orderBy(desc(visitors.createdAt)).limit(200),
    Promise.all([
      db.select({ count: briefs.id }).from(briefs),
      db.select({ count: visitors.id }).from(visitors),
    ]),
  ]);

  return NextResponse.json({
    briefs: recentBriefs,
    visitors: recentVisitors,
    stats: {
      totalBriefs: stats[0].length,
      totalVisitors: stats[1].length,
    },
  });
}
