import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitors, pageViews } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

function parseUserAgent(ua: string) {
  const deviceType = /Mobile|Android|iPhone/i.test(ua) ? 'mobile' : 
                     /Tablet|iPad/i.test(ua) ? 'tablet' : 'desktop';
  
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Iron)\/(\d+)/);
  const browserName = browserMatch?.[1] || 'Unknown';
  const browserVersion = browserMatch?.[2] || 'Unknown';
  
  const osMatch = ua.match(/(Windows|Mac|Linux|Android|iOS) ([^;)]+)/);
  const osName = osMatch?.[1] || 'Unknown';
  const osVersion = osMatch?.[2] || 'Unknown';
  
  return { deviceType, browserName, browserVersion, osName, osVersion };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      page,
      referrer,
      timeOnPage,
      scrollDepth,
      screenWidth,
      screenHeight,
      screenColorDepth,
      language,
      timezone,
      isFirstVisit,
    } = body;

    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

    const { deviceType, browserName, browserVersion, osName, osVersion } = parseUserAgent(userAgent);

    // Update or create visitor
    let visitorId: number;
    
    if (sessionId) {
      const existingVisitor = await db
        .select()
        .from(visitors)
        .where(eq(visitors.sessionId, sessionId))
        .limit(1);

      if (existingVisitor.length > 0) {
        visitorId = existingVisitor[0].id;
        await db
          .update(visitors)
          .set({
            currentPage: page,
            timeOnSite: (existingVisitor[0].timeOnSite || 0) + (timeOnPage || 0),
            visitCount: (existingVisitor[0].visitCount || 1) + 1,
            updatedAt: new Date(),
          })
          .where(eq(visitors.id, visitorId));
      } else {
        const newVisitor = await db
          .insert(visitors)
          .values({
            sessionId,
            userAgent,
            ipAddress,
            country,
            city,
            referrer,
            landingPage: page,
            currentPage: page,
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
            isFirstVisit: isFirstVisit || false,
            visitCount: 1,
          })
          .returning();
        visitorId = newVisitor[0].id;
      }
    } else {
      const newVisitor = await db
        .insert(visitors)
        .values({
          userAgent,
          ipAddress,
          country,
          city,
          referrer,
          landingPage: page,
          currentPage: page,
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
          isFirstVisit: true,
          visitCount: 1,
        })
        .returning();
      visitorId = newVisitor[0].id;
    }

    // Record page view
    await db.insert(pageViews).values({
      sessionId: sessionId || 'anonymous',
      visitorId,
      page,
      referrer,
      timeOnPage: timeOnPage || 0,
      scrollDepth: scrollDepth || 0,
    });

    return NextResponse.json({ success: true, visitorId });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}