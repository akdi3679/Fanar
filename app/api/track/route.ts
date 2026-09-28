import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitors } from '@/drizzle/schema';

export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ ok: true }); // DB not configured yet
    
    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
            || req.headers.get('cf-connecting-ip') 
            || 'unknown';
    const country = req.headers.get('cf-ipcountry') || 'unknown';
    const acceptLang = req.headers.get('accept-language') || '';
    const language = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';

    await db.insert(visitors).values({
      ip,
      country,
      language,
      page: body.page || '/',
      referrer,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Silent fail — tracking shouldn't break the site
    return NextResponse.json({ ok: true });
  }
}
