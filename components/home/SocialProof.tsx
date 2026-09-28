"use client";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/home/Reveal";
import { Quote } from "lucide-react";

export function SocialProof() {
  const t = useTranslations("proof");
  return (
    <section className="relative py-24 px-6 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <Quote className="w-10 h-10 text-blue-500/40 mx-auto mb-8" />
          <p className="text-2xl md:text-3xl text-white/90 font-light leading-relaxed">“{t("quote")}”</p>
          <p className="mt-6 text-white/50 text-sm tracking-wide">— {t("quoteAuthor")}</p>
        </Reveal>
      </div>
    </section>
  );
}
