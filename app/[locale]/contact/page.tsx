"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Loader2, Lock, Info, X } from "lucide-react";
import { QualificationWizard, type QualificationAnswers } from "@/components/contact/QualificationWizard";
import { AudioRecorder } from "@/components/contact/AudioRecorder";
import { TextBlurIn } from "@/components/ui/TextBlurIn";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const greetingMap: Record<string, string> = { fr: "Bonjour", en: "Hello", ar: "مرحباً", es: "Hola", de: "Hallo" };
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const router = useRouter();
  const greeting = greetingMap[locale] || greetingMap.en;

  const [stage, setStage] = useState<"greeting" | "qualify" | "form" | "success">("greeting");
  const [qualification, setQualification] = useState<QualificationAnswers | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Business type defaults to EMPTY — never pre-fill user's business
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    businessName: "", businessType: "", oldWebsite: "",
    business: "", goal: "", timeline: "", budget: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setStage("qualify"), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast) { const timer = setTimeout(() => setToast(null), 6000); return () => clearTimeout(timer); }
  }, [toast]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const nameOk = form.name.trim().length >= 2;
  const emailOk = emailRe.test(form.email.trim());
  const businessOk = form.business.trim().length >= 5;
  const canSubmit = nameOk && emailOk && businessOk && !submitting;

  const handleQualificationComplete = (answers: QualificationAnswers) => {
    setQualification(answers);
    // Auto-fill GOAL only — NOT business type (that's up to user)
    const goalMap: Record<string, string> = {
      call_book: "Get more clients", buy: "Sell products online",
      showcase_contact: "Showcase my work", learn: "Build credibility",
    };
    if (answers.goal && goalMap[answers.goal]) update("goal", goalMap[answers.goal]);
    setStage("form");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: locale, audioTranscript: "", qualification }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fieldErrors = data?.details?.fieldErrors || {};
        const firstField = Object.keys(fieldErrors)[0];
        const msg = firstField ? `${firstField}: ${fieldErrors[firstField][0]}` : (data?.error || data?.detail || t("toastError"));
        throw new Error(msg);
      }
      setStage("success");
      setToast({ type: "success", message: t("toastSuccess") });
    } catch (err: any) {
      setToast({ type: "error", message: err?.message || t("toastError") });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const Req = () => <span className="text-red-500 ml-0.5">*</span>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white relative">
      <Header />

      {toast && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 animate-slide-in max-w-sm">
          <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-12">
        {stage === "greeting" && (
          <div className="min-h-[60vh] flex items-center justify-center px-6">
            <TextBlurIn by="character" duration={1} staggerDelay={0.08} className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight text-center">
              {greeting}
            </TextBlurIn>
          </div>
        )}

        {stage === "qualify" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t("wizardTitle")}</h1>
              <p className="text-slate-600 max-w-xl mx-auto">{t("wizardSubtitle")}</p>
            </div>
            <QualificationWizard onComplete={handleQualificationComplete} />
          </div>
        )}

        {stage === "form" && (
          <div>
            <div className="text-center mb-10">
              <button onClick={() => setStage("qualify")} disabled={submitting} className="text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4 disabled:opacity-50">← {t("backToQuestions")}</button>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t("title")}</h1>
              <p className="text-slate-600">{t("subtitle")}</p>
            </div>

            <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
              <fieldset disabled={submitting} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">{t("sectionYou")}</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("name")}<Req /></label>
                    <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("namePlaceholder")} className={inputClass} autoComplete="name" />
                    {form.name.length > 0 && !nameOk && <p className="text-xs text-red-500 mt-1">{t("valName")}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("email")}<Req /></label>
                      <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder={t("emailPlaceholder")} className={inputClass} autoComplete="email" />
                      {form.email.length > 0 && !emailOk && <p className="text-xs text-red-500 mt-1">{t("valEmail")}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("phone")}</label>
                      <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder={t("phonePlaceholder")} className={inputClass} autoComplete="tel" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">{t("sectionBusiness")}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("businessName")}</label>
                      <input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder={t("businessNamePlaceholder")} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("businessType")}</label>
                      <select value={form.businessType} onChange={(e) => update("businessType", e.target.value)} className={inputClass}>
                        <option value="">{t("selectType")}</option>
                        <option value="retail">{t("typeRetail")}</option>
                        <option value="restaurant">{t("typeRestaurant")}</option>
                        <option value="professional">{t("typeProfessional")}</option>
                        <option value="coach">{t("typeCoach")}</option>
                        <option value="creator">{t("typeCreator")}</option>
                        <option value="agency">{t("typeAgency")}</option>
                        <option value="nonprofit">{t("typeNonprofit")}</option>
                        <option value="startup">{t("typeStartup")}</option>
                        <option value="other">{t("typeOther")}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("oldWebsite")}</label>
                    <input type="url" value={form.oldWebsite} onChange={(e) => update("oldWebsite", e.target.value)} placeholder={t("oldWebsitePlaceholder")} className={inputClass} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">{t("sectionProject")}</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t("businessDescription")}<Req /></label>
                    <div className="mb-4">
                      <AudioRecorder locale={locale} disabled={submitting} onTranscript={(text) => update("business", form.business ? form.business + " " + text : text)} />
                    </div>
                    <textarea required rows={5} value={form.business} onChange={(e) => update("business", e.target.value)} placeholder={t("businessPlaceholder")} className={inputClass + " resize-none"} />
                    <div className="flex justify-between mt-1.5">
                      <p className="text-xs text-slate-400">{t("businessHelp")}</p>
                      <p className={`text-xs ${businessOk ? "text-green-600" : "text-slate-400"}`}>{form.business.trim().length}/5</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">{t("sectionTimeline")}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("timeline")}</label>
                      <select value={form.timeline} onChange={(e) => update("timeline", e.target.value)} className={inputClass}>
                        <option value="">{t("selectTimeline")}</option>
                        <option value="ASAP">{t("timelineASAP")}</option>
                        <option value="1-2 months">{t("timeline12")}</option>
                        <option value="3+ months">{t("timeline3")}</option>
                        <option value="Just exploring">{t("timelineExplore")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                        {t("paymentLabel")}
                        <span className="relative group inline-flex">
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 rounded-xl bg-slate-900 text-white text-xs leading-relaxed shadow-xl z-20">{t("paymentInfo")}</span>
                        </span>
                      </label>
                      <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className={inputClass}>
                        <option value="">{t("paymentChoose")}</option>
                        <option value="cash">{t("payCash")}</option>
                        <option value="installments">{t("payInstallments")}</option>
                        <option value="discuss">{t("payDiscuss")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>

              <button type="submit" disabled={!canSubmit} className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? t("submitting") : t("submit")}
              </button>
              <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5"><Lock className="w-3 h-3" /> {t("privacy")}</p>
            </form>
          </div>
        )}

        {stage === "success" && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{t("successTitle")}</h1>
            <p className="text-slate-600 mb-8">{t("successText")}</p>
            <button onClick={() => router.push(`/${locale}`)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">{t("backToHome")}</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}