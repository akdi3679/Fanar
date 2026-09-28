import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TextBlurIn } from "@/components/ui/TextBlurIn";
import { HandwritingText } from "@/components/ui/HandwritingText";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import {
  ArrowRight, MessageSquare, PenLine, Rocket, Quote, Sparkles, Wrench, HeartHandshake,
} from "lucide-react";

const highlightMap: Record<string, string> = {
  fr: "psychologie & science", en: "psychology & science", ar: "علم النفس والعلوم",
  es: "psicología y ciencia", de: "Psychologie & Wissenschaft",
};

export default async function HomePage() {
  const t = await getTranslations("Home");
  const locale = await getLocale();
  const highlight = highlightMap[locale] || highlightMap.en;

  const steps = t.raw("process.steps") as { title: string; desc: string }[];
  const stats = t.raw("stats.items") as { value: string; label: string }[];
  const stepIcons = [MessageSquare, PenLine, Rocket, Sparkles, Wrench, HeartHandshake];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100 mb-6">{t("hero.badge")}</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">{t("hero.title")}</h1>
          <div className="mt-5 flex justify-center text-3xl md:text-5xl font-bold text-blue-600 min-h-[1.4em]">
            <HandwritingText text={highlight} className="text-blue-600" height="1.15em" strokeWidth={2} />
          </div>
          <div className="mt-6 flex justify-center">
            <TextBlurIn className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{t("hero.subtitle")}</TextBlurIn>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">{t("hero.cta")} <ArrowRight className="w-5 h-5" /></Link>
            <a href="#process" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">{t("hero.ctaSecondary")}</a>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-slate-900">{s.value}</div>
                <div className="mt-1 text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <ServicesGrid />

        <section id="process" className="bg-slate-50 py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t("process.title")}</h2>
              <TextBlurIn className="mt-4 text-slate-600 max-w-xl mx-auto">{t("process.subtitle")}</TextBlurIn>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((s, i) => {
                const Icon = stepIcons[i];
                return (
                  <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5"><Icon className="w-7 h-7 text-white" /></div>
                    <div className="text-sm font-semibold text-blue-600 mb-2">0{i + 1}</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Quote className="w-10 h-10 text-blue-200 mx-auto mb-6" />
          <blockquote className="text-2xl text-slate-800 font-medium leading-relaxed">"{t("testimonial.quote")}"</blockquote>
          <div className="mt-6">
            <div className="font-semibold text-slate-900">{t("testimonial.author")}</div>
            <div className="text-sm text-slate-500">{t("testimonial.role")}</div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="rounded-3xl bg-slate-900 px-8 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{t("cta.title")}</h2>
            <TextBlurIn className="mt-4 text-slate-300 max-w-xl mx-auto">{t("cta.subtitle")}</TextBlurIn>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors">{t("cta.button")} <ArrowRight className="w-5 h-5" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}