import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { briefs } from "@/drizzle/schema";

function parseUA(ua: string) {
  const deviceType = /Mobile|Android|iPhone/i.test(ua) ? "mobile"
    : /Tablet|iPad/i.test(ua) ? "tablet" : "desktop";
  const b = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Iron)\/(\d+)/);
  const o = ua.match(/(Windows|Mac|Linux|Android|iOS)[ \/]?([\d._]*)/);
  return { deviceType, browserName: b?.[1] || "Unknown", osName: o?.[1] || "Unknown" };
}

async function sendTextToTelegram(text: string): Promise<{ ok: boolean; detail?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("[telegram] MISSING env vars. token set:", !!token, "chatId set:", !!chatId);
    return { ok: false, detail: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in env" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      console.error("[telegram] sendMessage failed:", json.description || res.status);
      return { ok: false, detail: json.description || `HTTP ${res.status}` };
    }
    console.log("[telegram] text message sent OK");
    return { ok: true };
  } catch (e: any) {
    console.error("[telegram] sendMessage error:", e?.message || e);
    return { ok: false, detail: e?.message };
  }
}

async function sendVoiceToTelegram(blob: Blob, caption: string): Promise<{ ok: boolean; detail?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("[telegram] MISSING env vars for voice. token set:", !!token, "chatId set:", !!chatId);
    return { ok: false, detail: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID" };
  }

  try {
    const fd = new FormData();
    fd.append("chat_id", chatId);
    fd.append("voice", blob, "voice.webm");
    if (caption) fd.append("caption", caption.slice(0, 1024));

    const res = await fetch(`https://api.telegram.org/bot${token}/sendVoice`, {
      method: "POST",
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      console.error("[telegram] sendVoice failed:", json.description || res.status);
      return { ok: false, detail: json.description || `HTTP ${res.status}` };
    }
    console.log("[telegram] voice message sent OK");
    return { ok: true };
  } catch (e: any) {
    console.error("[telegram] sendVoice error:", e?.message || e);
    return { ok: false, detail: e?.message };
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
    const desc = String(data.businessDescription || "").trim();

    if (!name || name.length < 2) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    if (!audioBlob && (!desc || desc.length < 5)) return NextResponse.json({ error: "Message or voice required" }, { status: 400 });

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    const parsed = parseUA(ua);

    // Save to DB
    let saved = false;
    if (db) {
      try {
        await db.insert(briefs).values({
          id: crypto.randomUUID(),
          name, email,
          phone: data.phone || null,
          businessName: data.businessName || null,
          businessType: data.businessType || null,
          businessDescription: desc || "[voice message only]",
          projectType: data.projectType || null,
          budget: data.budget || null,
          timeline: data.timeline || null,
          language: data.language || "en",
          questionnaire: data.questionnaire ? JSON.parse(String(data.questionnaire)) : null,
          userAgent: ua, ipAddress: ip, country,
          deviceType: parsed.deviceType, browserName: parsed.browserName, osName: parsed.osName,
        } as any);
        saved = true;
        console.log("[brief] saved to DB OK");
      } catch (e) {
        console.error("[brief] DB save failed:", e);
      }
    }

    // Build caption with ALL info (questions + form)
    let q: any = {};
    try { q = data.questionnaire ? JSON.parse(String(data.questionnaire)) : {}; } catch {}

    const caption =
      `🎙 <b>NEW BRIEF — Fanar</b>\n\n` +
      `👤 <b>${name}</b>\n📧 ${email}\n` +
      (data.phone ? `📱 ${data.phone}\n` : "") +
      (data.businessName ? `🏢 ${data.businessName}\n` : "") +
      (data.businessType ? `🏷 ${data.businessType}\n` : "") +
      (data.projectType ? `🎯 Goal: ${data.projectType}\n` : "") +
      (data.budget ? `💰 Budget: ${data.budget}\n` : "") +
      (data.timeline ? `⏱ Timeline: ${data.timeline}\n` : "") +
      (q.q1 ? `\n❓ Q1: ${q.q1}\n` : "") +
      (q.q2 ? `❓ Q2: ${q.q2}\n` : "") +
      (q.q3 ? `❓ Q3: ${q.q3}\n` : "") +
      `🌍 ${country}\n\n` +
      (desc ? `📝 ${desc.slice(0, 600)}` : "🎙 Voice message attached");

    // Send to Telegram
    let telegram: { ok: boolean; detail?: string };
    if (audioBlob) {
      telegram = await sendVoiceToTelegram(audioBlob, caption);
      // If voice fails, fall back to text so nothing is lost
      if (!telegram.ok) {
        console.log("[telegram] voice failed, falling back to text");
        telegram = await sendTextToTelegram(caption + "\n\n⚠️ (voice upload failed, text only)");
      }
    } else {
      telegram = await sendTextToTelegram(caption);
    }

    return NextResponse.json({ success: true, saved, telegram });
  } catch (err: any) {
    console.error("[brief] unexpected error:", err?.message || err);
    return NextResponse.json({ error: "Server error", detail: err?.message }, { status: 500 });
  }
}