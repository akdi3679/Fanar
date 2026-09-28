"use client";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/home/Reveal";

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as { title: string; desc: string }[];
  return (
    <section id="process" className="relative py-24 md:py-32 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 className="text-3xl md:text-4xl text-white font-light text-center mb-4">{t("title")}</h2>
          <p className="text-white/60 text-center text-lg mb-16 max-w-2xl mx-auto">{t("subtitle")}</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent h-full">
                <span className="text-5xl font-thin bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-lg text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
