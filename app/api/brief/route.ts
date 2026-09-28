import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Relaxed schema — empty strings are OK, missing fields are OK
const BriefSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().trim().max(30).optional().nullable().or(z.literal("")),
  businessName: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  businessType: z.string().trim().max(100).optional().nullable().or(z.literal("")),
  oldWebsite: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  business: z.string().trim().min(5).max(5000),
  goal: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  timeline: z.string().trim().max(100).optional().nullable().or(z.literal("")),
  trigger: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  budget: z.string().trim().max(50).optional().nullable().or(z.literal("")),
  language: z.string().trim().max(10).default("en"),
  audioTranscript: z.string().optional().nullable().or(z.literal("")),
  qualification: z.any().optional().nullable(),
});

// Helper: normalize empty strings to null
function normalize<T>(obj: T): T {
  const result: any = {};
  for (const [k, v] of Object.entries(obj as any)) {
    result[k] = v === "" || v === undefined ? null : v;
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = BriefSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = normalize(parsed.data);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    const country = req.headers.get("x-vercel-ip-country") || "local";
    const userAgent = req.headers.get("user-agent") || "";

    // Try DB save — silently continue if DB is not configured
    let dbSaved = false;
    try {
      const { db } = await import("@/lib/db").catch(() => ({ db: null }));
      if (db) {
        const { briefs } = await import("@/drizzle/schema");
        await db.insert(briefs).values({
          name: data.name,
          email: data.email,
          phone: data.phone,
          businessName: data.businessName,
          businessType: data.businessType,
          oldWebsite: data.oldWebsite,
          business: data.business,
          goal: data.goal || "Contact inquiry",
          timeline: data.timeline,
          trigger: data.trigger,
          budget: data.budget,
          language: data.language,
          country,
          ip,
          userAgent,
          audioTranscript: data.audioTranscript,
        });
        dbSaved = true;
      }
    } catch (dbErr) {
      console.error("DB save failed:", dbErr);
      // Don't fail the request — Telegram still works
    }

    // Try Telegram — silently continue if not configured
    let telegramSent = false;
    try {
      const { sendTelegramMessage, formatBriefNotification } = await import("@/lib/telegram");
      telegramSent = await sendTelegramMessage(formatBriefNotification({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        businessName: data.businessName || undefined,
        businessType: data.businessType || undefined,
        oldWebsite: data.oldWebsite || undefined,
        business: data.business,
        goal: data.goal || undefined,
        timeline: data.timeline || undefined,
        trigger: data.trigger || undefined,
        budget: data.budget || undefined,
        country,
        language: data.language,
      }));
    } catch (tgErr) {
      console.error("Telegram failed:", tgErr);
    }

    return NextResponse.json({
      success: true,
      dbSaved,
      telegramSent,
    });
  } catch (error) {
    console.error("Brief handler crashed:", error);
    return NextResponse.json(
      { error: "Server error", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}