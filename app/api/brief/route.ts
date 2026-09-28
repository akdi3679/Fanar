import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { briefs } from '@/drizzle/schema';
import { z } from 'zod';

const BriefSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  businessDescription: z.string().min(5).max(5000),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  language: z.string().default('fr'),
  questionnaire: z.any().optional(),
});

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const validated = BriefSchema.parse(body);

    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

    const deviceType = /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 
                       /Tablet|iPad/i.test(userAgent) ? 'tablet' : 'desktop';
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera|Iron)\/(\d+)/);
    const browserName = browserMatch?.[1] || 'Unknown';
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS) ([^;)]+)/);
    const osName = osMatch?.[1] || 'Unknown';

    await db.insert(briefs).values({
      ...validated,
      questionnaire: validated.questionnaire || null,
      userAgent,
      ipAddress,
      country,
      city,
      referrer: req.headers.get('referer') || null,
      landingPage: req.headers.get('referer') || null,
      deviceType,
      browserName,
      osName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Brief submission error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to submit brief' },
      { status: 500 }
    );
  }
}