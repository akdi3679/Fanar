import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitors, pageViews } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

function parseUserAgent(ua: string) {
  const deviceType = /Mobile|Android|iPhone/i.test(ua) ? 'mobile'
    : /Tablet|iPad/i.test(ua) ? 'tablet' : 'desktop';

  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Iron)\/(\d+)/);
  const browserName = browserMatch?.[1] || 'Unknown';
  const browserVersion = browserMatch?.[2] || 'Unknown';

  const osMatch = ua.match(/(Windows|Mac OS X|Linux|Android|iOS)[ \/]?([\d._]*)/);
  const osName = osMatch?.[1] || 'Unknown';
  const osVersion = osMatch?.[2] || 'Unknown';

  return { deviceType, browserName, browserVersion, osName, osVersion };
}

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ success: false, error: 'DB not configured' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      sessionId, page, referrer, timeOnPage, scrollDepth,
      screenWidth, screenHeight, screenColorDepth, language, timezone, isFirstVisit,
    } = body;

    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

    const { deviceType, browserName, browserVersion, osName, osVersion } = parseUserAgent(userAgent);

    const commonFields = {
      userAgent,
      ipAddress,
      country,
      city,
      referrer: referrer || null,
      landingPage: page || '/',
      currentPage: page || '/',
      timeOnPage: timeOnPage || 0,
      timeOnSite: timeOnPage || 0,
      deviceType,
      browserName,
      browserVersion,
      osName,
      osVersion,
      screenWidth: screenWidth || 0,
      screenHeight: screenHeight || 0,
      screenColorDepth: screenColorDepth || 0,
      language: language || 'Unknown',
      timezone: timezone || 'Unknown',
      visitCount: 1,
    };

    let visitorId: string;

    if (sessionId) {
      const existing = await db
        .select()
        .from(visitors)
        .where(eq(visitors.sessionId, sessionId))
        .limit(1);

      if (existing.length > 0) {
        visitorId = existing[0].id;
        await db
          .update(visitors)
          .set({
            currentPage: page || '/',
            timeOnSite: (existing[0].timeOnSite || 0) + (timeOnPage || 0),
            visitCount: (existing[0].visitCount || 1) + 1,
            updatedAt: new Date(),
          })
          .where(eq(visitors.id, visitorId));
      } else {
        const inserted = await db
          .insert(visitors)
          .values({ ...commonFields, sessionId, isFirstVisit: isFirstVisit ?? true })
          .returning();
        visitorId = inserted[0].id;
      }
    } else {
      const inserted = await db
        .insert(visitors)
        .values({ ...commonFields, sessionId: null, isFirstVisit: true })
        .returning();
      visitorId = inserted[0].id;
    }

    await db.insert(pageViews).values({
      sessionId: sessionId || 'anonymous',
      visitorId,
      page: page || '/',
      referrer: referrer || null,
      timeOnPage: timeOnPage || 0,
      scrollDepth: scrollDepth || 0,
    });

    return NextResponse.json({ success: true, visitorId });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}