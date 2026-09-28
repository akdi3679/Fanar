"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Send, CheckCircle2, Loader2, Lock, Info } from "lucide-react";
import { QualificationWizard, type QualificationAnswers } from "@/components/contact/QualificationWizard";
import { AudioRecorder } from "@/components/contact/AudioRecorder";
import { TextBlurIn } from "@/components/ui/TextBlurIn";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const greetingMap: Record<string, string> = {
  fr: "Bonjour", en: "Hello", ar: "مرحباً", es: "Hola", de: "Hallo",
};

const emptyForm = {
  name: "", email: "", phone: "",
  businessName: "", businessType: "", oldWebsite: "",
  business: "", goal: "", timeline: "", budget: "",
};

export default function ContactPage() {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const greeting = greetingMap[locale] || "Hello";

  const [stage, setStage] = useState<"greeting" | "fading" | "qualify" | "form" | "error" | "success">("greeting");
  const [submitting, setSubmitting] = useState(false);
  const [qualification, setQualification] = useState<QualificationAnswers | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Stage transitions: greeting -> fading -> qualify ; success -> (2s) -> greeting (restart flow)
  useEffect(() => {
    if (stage === "greeting") {
      const stay = setTimeout(() => setStage("fading"), 1800);
      return () => clearTimeout(stay);
    }
    if (stage === "fading") {
      const fade = setTimeout(() => setStage("qualify"), 500);
      return () => clearTimeout(fade);
    }
    if (stage === "success") {
      // After success, wait 2s then restart the whole flow (greeting -> questions)
      const back = setTimeout(() => setStage("greeting"), 2000);
      return () => clearTimeout(back);
    }
  }, [stage]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleQualificationComplete = (answers: QualificationAnswers) => {
    setQualification(answers);
    const goalMap: Record<string, string> = {
      call_book: "Get more clients",
      buy: "Sell products online",
      showcase_contact: "Showcase my work",
      learn: "Build credibility",
    };
    if (answers.goal && goalMap[answers.goal]) update("goal", goalMap[answers.goal]);
    setStage("form");
  };

  const handleAudioRecorded = (blob: Blob) => setAudioBlob(blob);
  const removeAudio = () => setAudioBlob(null);

  const hasMessage = form.business.trim().length >= 5 || audioBlob !== null;
  const nameOk = form.name.trim().length >= 2;
  const emailOk = /\S+@\S+\.\S+/.test(form.email);
  const canSubmit = nameOk && emailOk && hasMessage && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      // Send EVERY field, filled or empty
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("businessName", form.businessName);
      formData.append("businessType", form.businessType);
      formData.append("oldWebsite", form.oldWebsite);
      formData.append("businessDescription", form.business);
      formData.append("projectType", form.goal);
      formData.append("budget", form.budget);
      formData.append("timeline", form.timeline);
      formData.append("language", locale);
      formData.append("questionnaire", JSON.stringify(qualification || {}));
      if (audioBlob) formData.append("audio", audioBlob, `voice-${Date.now()}.webm`);

      const res = await fetch("/api/brief", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to submit");

      setToast({ type: "success", message: t("toastSuccess") });
      // Reset everything so the next submission starts fresh with questions
      setForm(emptyForm);
      setAudioBlob(null);
      setQualification(null);
      setStage("success"); // shows success, then auto-restarts flow after 2s
    } catch {
      setStage("error");
      setToast({ type: "error", message: t("toastError") });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white relative">
      <Header />

      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in max-w-sm">
          <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${
            toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${toast.type === "success" ? "text-green-600" : "text-red-600"}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Greeting */}
        {(stage === "greeting" || stage === "fading") && (
          <div className="min-h-[60vh] flex items-center justify-center transition-opacity duration-500" style={{ opacity: stage === "fading" ? 0 : 1 }}>
            <TextBlurIn by="character" duration={1} staggerDelay={0.08} className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight">
              {greeting}
            </TextBlurIn>
          </div>
        )}

        {/* Questions */}
        {stage === "qualify" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t("wizardTitle")}</h1>
              <p className="text-slate-600 max-w-xl mx-auto">{t("wizardSubtitle")}</p>
            </div>
            <QualificationWizard onComplete={handleQualificationComplete} />
          </div>
        )}

        {/* Form */}
        {(stage === "form" || stage === "error") && (
          <div>
            <div className="text-center mb-10">
              <button onClick={() => setStage("qualify")} disabled={submitting} className="text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4 disabled:opacity-50">
                ← {t("backToQuestions")}
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t("title")}</h1>
              <p className="text-slate-600">{t("subtitle")}</p>
            </div>

            <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
              <fieldset disabled={submitting} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">{t("sectionYou")}</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("name")} <span className="text-red-500">*</span></label>
                    <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("namePlaceholder")} className={inputClass} autoComplete="name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("email")} <span className="text-red-500">*</span></label>
                      <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder={t("emailPlaceholder")} className={inputClass} autoComplete="email" />
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
                        <option value="E-commerce">{t("typeEcom")}</option>
                        <option value="Service">{t("typeService")}</option>
                        <option value="Portfolio">{t("typePortfolio")}</option>
                        <option value="Blog">{t("typeBlog")}</option>
                        <option value="Other">{t("typeOther")}</option>
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
                  <p className="text-sm text-slate-500">{t("messageChoice")}</p>
                  <AudioRecorder onRecordingComplete={handleAudioRecorded} onRemove={removeAudio} disabled={submitting} />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t("businessDescription")} {audioBlob ? "" : <span className="text-red-500">*</span>}
                    </label>
                    <textarea required={!audioBlob} rows={5} value={form.business} onChange={(e) => update("business", e.target.value)} placeholder={t("businessPlaceholder")} className={inputClass + " resize-none"} />
                    <p className="text-xs text-slate-400 mt-1.5">{t("businessHelp")}</p>
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

              {stage === "error" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{t("error")}</div>
              )}

              <button type="submit" disabled={!canSubmit} className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? t("submitting") : t("submit")}
              </button>

              <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" /> {t("privacy")}
              </p>
            </form>
          </div>
        )}

        {/* Success — shown for 2s, then flow restarts at greeting */}
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