"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { SiteTypeSelection } from "@/components/contact/SiteTypeSelection";
import { WebsiteBuilder, BuilderResult } from "@/components/contact/WebsiteBuilder";
import { TextBlurIn } from "@/components/ui/TextBlurIn";
import { SITE_TYPES } from "@/lib/features";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const greetingMap: Record<string, string> = {
  fr: "Bonjour", en: "Hello", ar: "مرحباً", es: "Hola", de: "Hallo",
};

export default function ContactPage() {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const greeting = greetingMap[locale] || "Hello";

  const [stage, setStage] = useState<"greeting" | "fading" | "siteType" | "builder" | "success">("greeting");
  const [siteType, setSiteType] = useState<import("@/lib/features").SiteTypeId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (stage === "greeting") {
      const stay = setTimeout(() => setStage("fading"), 1800);
      return () => clearTimeout(stay);
    }
    if (stage === "fading") {
      const fade = setTimeout(() => setStage("siteType"), 500);
      return () => clearTimeout(fade);
    }
    if (stage === "success") {
      const back = setTimeout(() => setStage("siteType"), 2500);
      return () => clearTimeout(back);
    }
  }, [stage]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleBuilderSubmit = async (r: BuilderResult) => {
    setSubmitting(true);
    try {
      const st = SITE_TYPES.find(s => s.id === r.siteType)!;
      const stName = st.name[locale as 'en'|'fr'|'ar'] || st.name.en;

      // Build a readable summary for Telegram + admin
      let summary = `🛠 ${stName} — Base ${r.basePrice}\n`;
      r.features.forEach(f => { summary += `➕ ${f.name}: ${f.price}\n`; });
      summary += `━━━━━━━━━━\n💰 TOTAL: ${r.totalPrice}`;

      const fd = new FormData();
      fd.append("name", r.contact.name);
      fd.append("email", r.contact.email);
      fd.append("phone", r.contact.phone);
      fd.append("businessType", stName);
      fd.append("businessDescription", summary);
      fd.append("projectType", "Website Builder");
      fd.append("budget", `${r.totalPrice}`);
      fd.append("language", locale);
      fd.append("questionnaire", JSON.stringify({
        siteType: r.siteType,
        basePrice: r.basePrice,
        features: r.features,
        totalPrice: r.totalPrice,
        quickTest: r.quickTest
      }));

      const res = await fetch("/api/brief", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");

      setToast({ type: "success", message: t("toastSuccess") });
      setStage("success");
    } catch {
      setToast({ type: "error", message: t("toastError") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white relative">
      <Header />

      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-sm">
          <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${
            toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${toast.type === "success" ? "text-green-600" : "text-red-600"}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Greeting */}
        {(stage === "greeting" || stage === "fading") && (
          <div className="min-h-[60vh] flex items-center justify-center transition-opacity duration-500" style={{ opacity: stage === "fading" ? 0 : 1 }}>
            <TextBlurIn by="character" duration={1} staggerDelay={0.08} className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight">
              {greeting}
            </TextBlurIn>
          </div>
        )}

        {/* Site type selection */}
        {stage === "siteType" && (
          <SiteTypeSelection onSelect={(id) => { setSiteType(id); setStage("builder"); }} />
        )}

        {/* Builder */}
        {stage === "builder" && siteType && (
          <WebsiteBuilder
            siteType={siteType}
            onBack={() => setStage("siteType")}
            onSubmit={handleBuilderSubmit}
            submitting={submitting}
          />
        )}

        {/* Success */}
        {stage === "success" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("successTitle")}</h2>
            <p className="text-slate-600">{t("successText")}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}