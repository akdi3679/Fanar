"use client";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/home/LanguageSwitcher";
import { ArrowRight } from "lucide-react";

export default function Header() {
  const t = useTranslations("Home.nav");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-slate-900">
          Fanar<span className="text-blue-600">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
          <a href={`/${locale}#services`} className="hover:text-slate-900 transition-colors">{t("services")}</a>
          <a href={`/${locale}#process`} className="hover:text-slate-900 transition-colors">{t("process")}</a>
          <Link href="/pricing" className="hover:text-slate-900 transition-colors font-medium text-blue-600">{t("pricing")}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/contact" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            {t("contact")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}