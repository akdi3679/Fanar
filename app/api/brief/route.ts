import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { briefs } from "@/drizzle/schema";

const env = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
};

function parseUA(ua: string) {
  const deviceType = /Mobile|Android|iPhone/i.test(ua) ? "mobile"
    : /Tablet|iPad/i.test(ua) ? "tablet" : "desktop";
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Iron)\/(\d+)/);
  const os = ua.match(/(Windows|Mac|Linux|Android|iOS)[ \/]?([\d._]*)/);
  return {
    deviceType,
    browserName: browser?.[1] || "Unknown",
    osName: os?.[1] || "Unknown",
  };
}

async function uploadAudioToSupabase(blob: Blob, filename: string): Promise<string | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) return null;
  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/storage/v1/object/briefs/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_KEY}`,
          "Content-Type": blob.type,
          "x-upsert": "true",
        },
        body: blob,
      }
    );
    if (!res.ok) return null;
    return `${env.SUPABASE_URL}/storage/v1/object/public/briefs/${filename}`;
  } catch {
    return null;
  }
}

async function sendVoiceToTelegram(blob: Blob, caption: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  try {
    const fd = new FormData();
    fd.append("chat_id", env.TELEGRAM_CHAT_ID);
    fd.append("voice", blob, "voice.webm");
    fd.append("caption", caption.slice(0, 1024));
    const res = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendVoice`,
      { method: "POST", body: fd }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function sendTextToTelegram(text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  try {
    await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";
    let data: Record<string, any> = {};
    let audioBlob: Blob | null = null;

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      fd.forEach((value, key) => {
        if (key === "audio" && value instanceof Blob) audioBlob = value;
        else data[key] = value;
      });
    } else {
      data = await req.json();
    }

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const businessDesc = String(data.businessDescription || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name required (min 2 chars)" }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!audioBlob && (!businessDesc || businessDesc.length < 5)) {
      return NextResponse.json({ error: "Message required (min 5 chars) or voice recording" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const city = req.headers.get("x-vercel-ip-city") || "Unknown";
    const parsed = parseUA(ua);

    // Upload audio to Supabase Storage (if bucket "briefs" exists)
    let audioUrl: string | null = null;
    if (audioBlob) {
      const filename = `brief-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webm`;
      audioUrl = await uploadAudioToSupabase(audioBlob, filename);
    }

    // Save brief to DB
    if (db) {
      try {
        await db.insert(briefs).values({
          id: crypto.randomUUID(),
          name,
          email,
          phone: data.phone || null,
          businessName: data.businessName || null,
          businessType: data.businessType || null,
          businessDescription: businessDesc || "[voice message only]",
          projectType: data.projectType || null,
          budget: data.budget || null,
          timeline: data.timeline || null,
          language: data.language || "en",
          questionnaire: data.questionnaire ? JSON.parse(String(data.questionnaire)) : null,
          userAgent: ua,
          ipAddress: ip,
          country,
          city,
          referrer: req.headers.get("referer") || null,
          landingPage: req.headers.get("referer") || null,
          deviceType: parsed.deviceType,
          browserName: parsed.browserName,
          osName: parsed.osName,
          ...(audioUrl ? { audioUrl } : {}),
        } as any);
      } catch (e) {
        console.error("DB insert error:", e);
      }
    }

    // Build Telegram caption
    const caption =
      `🎙 NEW BRIEF — Fanar Studio\n\n` +
      `👤 ${name}\n📧 ${email}\n` +
      (data.phone ? `📱 ${data.phone}\n` : "") +
      (data.businessName ? `🏢 ${data.businessName}\n` : "") +
      (data.projectType ? `🎯 ${data.projectType}\n` : "") +
      (data.budget ? `💰 ${data.budget}\n` : "") +
      (data.timeline ? `⏱ ${data.timeline}\n` : "") +
      `🌍 ${country} · ${data.language}\n\n` +
      (businessDesc ? `📝 ${businessDesc.slice(0, 400)}` : "🎙 Voice message attached");

    // Send: voice file (with caption) OR text-only
    if (audioBlob) {
      await sendVoiceToTelegram(audioBlob, caption);
      if (businessDesc && businessDesc.length > 400) {
        // If text was long, send the full text as a follow-up message
        await sendTextToTelegram(`📝 <b>Full message:</b>\n\n${businessDesc}`);
      }
    } else {
      await sendTextToTelegram(
        `🚀 <b>NEW BRIEF</b>\n\n` +
        `👤 <b>${name}</b>\n📧 ${email}\n` +
        (data.phone ? `📱 ${data.phone}\n` : "") +
        (data.businessName ? `🏢 ${data.businessName}\n` : "") +
        (data.projectType ? `🎯 ${data.projectType}\n` : "") +
        (data.budget ? `💰 ${data.budget}\n` : "") +
        (data.timeline ? `⏱ ${data.timeline}\n` : "") +
        `🌍 ${country}\n\n📝 ${businessDesc}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Brief error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}