"use client";
import { useTranslations, useLocale } from "next-intl";
import { MovingBorderBtn } from "@/components/ui/moving-border";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  const t = useTranslations("finalCta");
  const locale = useLocale();
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl text-white font-light leading-tight">{t("title")}</h2>
        <p className="mt-6 text-white/60 text-lg">{t("subtitle")}</p>
        <div className="mt-10 flex justify-center">
          <MovingBorderBtn href={`/${locale}/brief`}>
            <span className="flex items-center justify-center gap-2 text-sm font-medium">
              {t("button")} <ArrowRight className="w-4 h-4" />
            </span>
          </MovingBorderBtn>
        </div>
        <p className="mt-4 text-xs text-white/40">{t("note")}</p>
      </div>
    </section>
  );
}
