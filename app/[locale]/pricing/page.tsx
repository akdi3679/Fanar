import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check, ArrowRight, Rocket, Store, Layout, Search, Shield, PenLine, Bot, Newspaper, Wrench, Code, Database, Lock } from "lucide-react";

export default async function PricingPage() {
  const t = await getTranslations("Pricing");

  const packages = [
    { icon: Layout, name: t("p.landing.name"), price: t("p.landing.price"), desc: t("p.landing.desc"), features: t.raw("p.landing.features"), popular: false },
    { icon: Store,  name: t("p.vitrine.name"), price: t("p.vitrine.price"), desc: t("p.vitrine.desc"), features: t.raw("p.vitrine.features"), popular: true },
    { icon: Rocket, name: t("p.ecom.name"),    price: t("p.ecom.price"),    desc: t("p.ecom.desc"),    features: t.raw("p.ecom.features"), popular: false },
  ];

  const services = [
    { icon: Newspaper, name: t("s.blog.name"),     desc: t("s.blog.desc") },
    { icon: PenLine,   name: t("s.cms.name"),      desc: t("s.cms.desc") },
    { icon: Bot,       name: t("s.ai.name"),       desc: t("s.ai.desc") },
    { icon: Search,    name: t("s.seo.name"),      desc: t("s.seo.desc") },
    { icon: Shield,    name: t("s.security.name"), desc: t("s.security.desc") },
    { icon: Wrench,    name: t("s.maintenance.name"), desc: t("s.maintenance.desc") },
    { icon: Code,      name: t("s.custom.name"),   desc: t("s.custom.desc") },
    { icon: Database,  name: t("s.database.name"), desc: t("s.database.desc") },
    { icon: Lock,      name: t("s.audit.name"),    desc: t("s.audit.desc") },
  ];

  const maintenance = [
    { name: t("m.basic.name"),    price: t("m.basic.price"),    features: t.raw("m.basic.features") },
    { name: t("m.standard.name"), price: t("m.standard.price"), features: t.raw("m.standard.features"), popular: true },
    { name: t("m.premium.name"),  price: t("m.premium.price"),  features: t.raw("m.premium.features") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t("title")}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("subtitle")}</p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
            💵 {t("payFlex")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {packages.map((p, i) => (
            <div key={i} className={`relative rounded-3xl border p-8 flex flex-col ${p.popular ? "border-blue-500 bg-white shadow-xl shadow-blue-500/10 md:-mt-4 md:mb-4" : "border-slate-200 bg-white"}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">{t("popular")}</span>
              )}
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <p.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">{p.desc}</p>
              <div className="text-3xl font-bold text-slate-900 mb-6">{p.price}</div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {p.features.map((f: string, j: number) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className={`block text-center px-6 py-3.5 rounded-xl font-semibold transition-colors ${p.popular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}>
                {t("cta")}
              </Link>
            </div>
          ))}
        </div>

        {/* Services WITHOUT prices */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">{t("servicesTitle")}</h2>
        <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">{t("servicesSub")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {services.map((s, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm mb-1">{s.name}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-4">{t("maintTitle")}</h2>
        <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">{t("maintSub")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {maintenance.map((m, i) => (
            <div key={i} className={`rounded-3xl border p-7 ${m.popular ? "border-blue-500 bg-white shadow-lg" : "border-slate-200 bg-white"}`}>
              <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
              <div className="text-2xl font-bold text-slate-900 mt-2 mb-5">{m.price}</div>
              <ul className="space-y-2">
                {m.features.map((f: string, j: number) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-slate-900 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">{t("finalTitle")}</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8">{t("finalSub")}</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors">
            {t("finalCta")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}