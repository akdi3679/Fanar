import { env } from "./env";

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn("⚠️  Telegram not configured — skipping");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    
    if (!response.ok) {
      console.error("Telegram error:", await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Telegram send failed:", error);
    return false;
  }
}

export function formatBriefNotification(data: {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  oldWebsite?: string;
  business: string;
  goal?: string;
  timeline?: string;
  trigger?: string;
  budget?: string;
  language: string;
  country: string;
}): string {
  return `🚀 <b>NEW BRIEF — Fanar Studio</b>

👤 <b>Name:</b> ${data.name}
📧 <b>Email:</b> ${data.email}
📱 <b>Phone:</b> ${data.phone || "—"}

🏢 <b>Business:</b> ${data.businessName || "—"}
🏷️ <b>Type:</b> ${data.businessType || "—"}
🔗 <b>Old Site:</b> ${data.oldWebsite || "None"}

📝 <b>Description:</b>
${data.business}

🎯 <b>Goal:</b> ${data.goal || "—"}
⏱️ <b>Timeline:</b> ${data.timeline || "Flexible"}
💡 <b>Trigger:</b> ${data.trigger || "—"}
💰 <b>Budget:</b> ${data.budget || "To discuss"}

🌍 <b>Language:</b> ${data.language}
📍 <b>Country:</b> ${data.country}

⚡ <i>Reply within 2h to maximize conversion.</i>`;
}