"use client";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/home/Reveal";
import { AlertTriangle } from "lucide-react";

export function PainSection() {
  const t = useTranslations("pain");
  const points = t.raw("points") as string[];
  return (
    <section className="relative py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <h2 className="text-3xl md:text-4xl text-white font-light">{t("title")}</h2>
          </div>
          <p className="text-white/60 text-lg mb-12">{t("subtitle")}</p>
        </Reveal>
        <div className="grid gap-4">
          {points.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] text-white/80 leading-relaxed">
                {p}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
