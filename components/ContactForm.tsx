"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Send, CheckCircle2, Loader2, Lock } from "lucide-react";

export function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          business: form.message,
          goal: "Contact inquiry",
          budget: "",
          timeline: "",
          language: locale,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">{t("successTitle")}</h2>
        <p className="text-slate-600">{t("successText")}</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("name")} *</label>
        <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("namePlaceholder")} className={inputClass} autoComplete="name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("email")} *</label>
        <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder={t("emailPlaceholder")} className={inputClass} autoComplete="email" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("phone")}</label>
        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder={t("phonePlaceholder")} className={inputClass} autoComplete="tel" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("message")} *</label>
        <textarea required minLength={10} rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder={t("messagePlaceholder")} className={inputClass + " resize-none"} />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        {status === "loading" ? t("submitting") : t("submit")}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
        <Lock className="w-3 h-3" /> {t("privacy")}
      </p>
    </form>
  );
}