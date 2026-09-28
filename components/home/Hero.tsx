"use client";
import { useTranslations, useLocale } from "next-intl";
import { Spotlight } from "@/components/ui/spotlight";
import { MovingBorderBtn } from "@/components/ui/moving-border";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <Spotlight className="left-1/2 top-0" fill="#3b82f6" />
      <div className="relative z-10 text-center max-w-4xl mx-auto pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          {t("badge")}
        </div>
        <h1
          className="text-white font-light tracking-tight leading-[1.05]"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
        >
          {t("titleA")}{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent font-normal">
            {t("titleB")}
          </span>
        </h1>
        <p className="mt-6 text-white/60 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <MovingBorderBtn href={`/${locale}/brief`} containerClassName="w-full sm:w-auto">
            <span className="flex items-center justify-center gap-2 text-sm font-medium">
              {t("cta")} <ArrowRight className="w-4 h-4" />
            </span>
          </MovingBorderBtn>
          <a href={`/${locale}/#process`} className="px-8 py-4 text-sm text-white/70 hover:text-white transition-colors">
            {t("ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
