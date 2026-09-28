import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { briefs } from "@/drizzle/schema";

// Readable labels for questionnaire codes
const Q1: Record<string, string> = {
  yes_demand: "Yes, people already call/message me",
  some_growth: "I have some clients but I want more",
  starting: "I'm just starting my business",
  not_sure: "I'm not sure yet",
};
const Q2: Record<string, string> = {
  repeat_questions: "Answering the same questions over and over",
  bookings: "Taking orders/bookings by phone or WhatsApp",
  explaining: "Explaining what I do to new clients",
  finding_clients: "Finding new clients",
  nothing_special: "Nothing special, just curious",
};
const Q3: Record<string, string> = {
  call_book: "Call me or book an appointment",
  buy: "Buy something directly online",
  showcase_contact: "See my work, then contact me",
  learn: "Learn about my services and trust me",
  not_sure: "I'm not sure yet",
};

const orDash = (v: any) => (v !== null && v !== undefined && String(v).trim() !== "" ? String(v).trim() : "—");

function parseUA(ua: string) {
  const deviceType = /Mobile|Android|iPhone/i.test(ua) ? "mobile"
    : /Tablet|iPad/i.test(ua) ? "tablet" : "desktop";
  const b = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Iron)\/(\d+)/);
  const o = ua.match(/(Windows|Mac OS X|Linux|Android|iOS)[ \/]?([\d._]*)/);
  return { deviceType, browserName: b?.[1] || "Unknown", osName: o?.[1] || "Unknown" };
}

async function uploadAudioToSupabase(blob: Blob, filename: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/storage/v1/object/briefs/${filename}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": blob.type, "x-upsert": "true" },
      body: blob,
    });
    if (!res.ok) return null;
    return `${url}/storage/v1/object/public/briefs/${filename}`;
  } catch { return null; }
}

async function sendTextToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) { console.error("[telegram] missing env vars"); return false; }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) { console.error("[telegram] send failed:", j.description); return false; }
    return true;
  } catch (e) { console.error("[telegram] error:", e); return false; }
}

async function sendVoiceToTelegram(blob: Blob, caption: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) { console.error("[telegram] missing env vars"); return false; }
  try {
    const fd = new FormData();
    fd.append("chat_id", chatId);
    fd.append("voice", blob, "voice.webm");
    if (caption) fd.append("caption", caption.slice(0, 1024));
    const res = await fetch(`https://api.telegram.org/bot${token}/sendVoice`, { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) { console.error("[telegram] voice failed:", j.description); return false; }
    return true;
  } catch (e) { console.error("[telegram] voice error:", e); return false; }
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

    // Extract ALL fields (empty allowed)
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();
    const businessName = String(data.businessName || "").trim();
    const businessType = String(data.businessType || "").trim();
    const oldWebsite = String(data.oldWebsite || "").trim();
    const desc = String(data.businessDescription || "").trim();
    const projectType = String(data.projectType || "").trim();
    const budget = String(data.budget || "").trim();
    const timeline = String(data.timeline || "").trim();
    const language = String(data.language || "en").trim();

    if (!name || name.length < 2) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    if (!audioBlob && (!desc || desc.length < 5)) return NextResponse.json({ error: "Message or voice required" }, { status: 400 });

    // Map questionnaire codes -> readable text
    let qual: any = {};
    try { qual = data.questionnaire ? JSON.parse(String(data.questionnaire)) : {}; } catch {}
    const q1 = Q1[qual.clients] || qual.clients || "";
    const q2 = Q2[qual.timeSpent] || qual.timeSpent || "";
    const q3 = Q3[qual.goal] || qual.goal || "";

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const parsed = parseUA(ua);

    // Upload voice to Supabase Storage
    let audioUrl: string | null = null;
    if (audioBlob) {
      const fn = `brief-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webm`;
      audioUrl = await uploadAudioToSupabase(audioBlob, fn);
    }

    // Save EVERYTHING to Supabase
    if (db) {
      try {
        await db.insert(briefs).values({
          id: crypto.randomUUID(),
          name, email,
          phone: phone || null,
          businessName: businessName || null,
          businessType: businessType || null,
          oldWebsite: oldWebsite || null,
          businessDescription: desc || "[voice message only]",
          projectType: projectType || null,
          budget: budget || null,
          timeline: timeline || null,
          language,
          questionnaire: { q1, q2, q3, raw: qual },
          audioUrl: audioUrl || null,
          userAgent: ua, ipAddress: ip, country,
          deviceType: parsed.deviceType, browserName: parsed.browserName, osName: parsed.osName,
        } as any);
        console.log("[brief] saved to DB OK");
      } catch (e) { console.error("[brief] DB save failed:", e); }
    }

    // Build COMPLETE Telegram message (every field, filled or empty)
    const caption =
      `🎙 <b>NEW BRIEF — Fanar Studio</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 <b>CONTACT</b>\n` +
      `• Name: ${orDash(name)}\n` +
      `• Email: ${orDash(email)}\n` +
      `• Phone: ${orDash(phone)}\n\n` +
      `🏢 <b>BUSINESS</b>\n` +
      `• Business name: ${orDash(businessName)}\n` +
      `• Business type: ${orDash(businessType)}\n` +
      `• Current website: ${orDash(oldWebsite)}\n\n` +
      `🎯 <b>PROJECT</b>\n` +
      `• Description: ${desc ? desc.slice(0, 700) : (audioBlob ? "🎙 [voice message attached]" : "—")}\n` +
      `• Goal: ${orDash(projectType)}\n` +
      `• Budget: ${orDash(budget)}\n` +
      `• Timeline: ${orDash(timeline)}\n\n` +
      `❓ <b>QUESTIONNAIRE</b>\n` +
      `• Q1 — Do people look for what you offer?\n   ${orDash(q1)}\n` +
      `• Q2 — What takes most of your time?\n   ${orDash(q2)}\n` +
      `• Q3 — What should visitors do on your site?\n   ${orDash(q3)}\n\n` +
      `🎙 <b>VOICE:</b> ${audioBlob ? "attached ✅" : "none"}\n\n` +
      `🌍 <b>CONTEXT</b>\n` +
      `• Country: ${orDash(country)}\n` +
      `• Language: ${orDash(language)}\n` +
      `• Device: ${orDash(parsed.deviceType)} · ${orDash(parsed.browserName)} · ${orDash(parsed.osName)}`;

    // Send to Telegram: voice with full caption, or text
    if (audioBlob) {
      const voiceOk = await sendVoiceToTelegram(audioBlob, caption);
      if (!voiceOk) {
        // Fallback: send as text so nothing is lost
        await sendTextToTelegram(caption + "\n\n⚠️ (voice upload failed — text only)");
      }
      // If voice succeeded but caption was truncated, send full text as follow-up
      if (voiceOk && caption.length > 1000) {
        await sendTextToTelegram(caption);
      }
    } else {
      await sendTextToTelegram(caption);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[brief] error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}