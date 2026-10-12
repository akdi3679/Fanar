"use client";
import { useLocale } from "next-intl";
import { Rocket, Store, Layout, ArrowRight } from "lucide-react";
import { SITE_TYPES, SiteTypeId } from "@/lib/features";

const icons: Record<SiteTypeId, any> = { landing: Layout, vitrine: Store, ecommerce: Rocket };

export function SiteTypeSelection({ onSelect }: { onSelect: (id: SiteTypeId) => void }) {
  const locale = useLocale() as 'en' | 'fr' | 'ar';
  const pick = (l: any) => l[locale] || l.en;

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          {locale === 'fr' ? 'Quel type de site voulez-vous ?' : locale === 'ar' ? 'ما نوع الموقع الذي تريده؟' : 'What type of website do you want?'}
        </h1>
        <p className="text-slate-600">
          {locale === 'fr' ? 'Choisissez une option pour commencer à construire votre devis' : locale === 'ar' ? 'اختر خيارًا لبدء بناء عرض السعر' : 'Pick an option to start building your quote'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SITE_TYPES.map((st) => {
          const Icon = icons[st.id];
          return (
            <button
              key={st.id}
              onClick={() => onSelect(st.id)}
              className="group relative text-left bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{pick(st.name)}</h3>
              <p className="text-sm text-slate-500 mb-4">{pick(st.tagline)}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  {locale === 'fr' ? 'dès' : locale === 'ar' ? 'من' : 'from'} {st.basePrice.toLocaleString()}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all rtl:rotate-180" />
              </div>
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                {st.included.slice(0, 3).map((inc, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                    {pick(inc)}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}