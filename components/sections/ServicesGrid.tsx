import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Layout, Store, ShoppingCart, Newspaper, PenLine, Bot, Search, Shield, Wrench, Code, Database, Lock, ArrowRight,
} from "lucide-react";

const iconMap: Record<string, any> = {
  layout: Layout, store: Store, cart: ShoppingCart, blog: Newspaper, cms: PenLine, ai: Bot,
  seo: Search, shield: Shield, wrench: Wrench, code: Code, database: Database, lock: Lock,
};

// Memoized card component — renders once per service, no re-renders
function ServiceCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const Icon = iconMap[icon] || Layout;
  return (
    <div className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

export async function ServicesGrid() {
  const t = await getTranslations("Home");
  const services = t.raw("services.all") as { icon: string; title: string; desc: string; price: string }[];

  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-20">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t("services.title")}</h2>
        <p className="mt-4 text-slate-600 max-w-xl mx-auto">{t("services.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <ServiceCard key={i} icon={s.icon} title={s.title} desc={s.desc} />
        ))}
      </div>
      <div className="text-center mt-10">
        <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
          {t("seePricing")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}