"use client";
import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { Search, X, ShoppingCart, ChevronDown, ChevronUp, Check, GripVertical, Send, Clock, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { FEATURES, SITE_TYPES, CATEGORIES, SiteTypeId, Feature } from "@/lib/features";

export interface BuilderResult {
  siteType: SiteTypeId;
  basePrice: number;
  features: { id: string; name: string; price: number }[];
  totalPrice: number;
  quickTest: Record<string, string>;
  contact: { name: string; email: string; phone: string };
}

const QT = [
  { id: 'q1', en: 'Do customers ask if you have a website?', fr: 'Vos clients demandent-ils si vous avez un site ?', ar: 'هل يسأل عملاؤك إن كان لديك موقع؟' },
  { id: 'q2', en: 'Do you lose clients because they can\u2019t find your info online?', fr: 'Perdez-vous des clients car ils ne trouvent pas vos infos en ligne ?', ar: 'هل تخسر عملاء لأنهم لا يجدون معلوماتك أونلاين؟' },
  { id: 'q3', en: 'Do your competitors have websites?', fr: 'Vos concurrents ont-ils des sites web ?', ar: 'هل منافسوك لديهم مواقع؟' }
];

export function WebsiteBuilder({ siteType, onBack, onSubmit, submitting }: {
  siteType: SiteTypeId;
  onBack: () => void;
  onSubmit: (r: BuilderResult) => void;
  submitting: boolean;
}) {
  const locale = useLocale() as 'en' | 'fr' | 'ar';
  const pick = (l: any) => l[locale] || l.en;
  const st = SITE_TYPES.find(s => s.id === siteType)!;

  const [selected, setSelected] = useState<Feature[]>([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const [qtOpen, setQtOpen] = useState(false);
  const [qtAnswers, setQtAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });

  const available = useMemo(() => {
    return FEATURES.filter(f => {
      if (!f.siteTypes.includes(siteType)) return false;
      if (cat !== 'all' && f.category !== cat) return false;
      if (search) {
        const q = search.toLowerCase();
        return pick(f.name).toLowerCase().includes(q) || pick(f.desc).toLowerCase().includes(q);
      }
      return true;
    });
  }, [siteType, cat, search, locale]);

  const add = (f: Feature) => { if (!selected.find(s => s.id === f.id)) setSelected(p => [...p, f]); };
  const remove = (id: string) => setSelected(p => p.filter(f => f.id !== id));
  const total = st.basePrice + selected.reduce((s, f) => s + f.price, 0);
  const totalTime = selected.reduce((s, f) => s + f.timeDays, 0);
  const yesCount = Object.values(qtAnswers).filter(v => v === 'yes').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      siteType, basePrice: st.basePrice,
      features: selected.map(f => ({ id: f.id, name: pick(f.name), price: f.price })),
      totalPrice: total, quickTest: qtAnswers, contact
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {locale === 'fr' ? 'Changer le type de site' : locale === 'ar' ? 'تغيير نوع الموقع' : 'Change site type'}
      </button>

      {/* QUICK TEST banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl overflow-hidden">
        <button onClick={() => setQtOpen(!qtOpen)} className="w-full flex items-center justify-between px-5 py-4 text-left">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {locale === 'fr' ? 'Test rapide : avez-vous vraiment besoin d\u2019un site ?' : locale === 'ar' ? 'اختبار سريع: هل تحتاج فعلاً لموقع؟' : 'Quick test: do you really need a website?'}
              </p>
              <p className="text-xs text-slate-500">
                {locale === 'fr' ? '30 secondes · 3 questions' : locale === 'ar' ? '30 ثانية · 3 أسئلة' : '30 seconds · 3 questions'}
              </p>
            </div>
          </div>
          {qtOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        {qtOpen && (
          <div className="px-5 pb-5 space-y-3">
            {QT.map(q => (
              <div key={q.id} className="bg-white rounded-xl p-3 border border-blue-100">
                <p className="text-sm text-slate-700 mb-2">{locale === 'fr' ? q.fr : locale === 'ar' ? q.ar : q.en}</p>
                <div className="flex gap-2">
                  {['yes', 'no'].map(opt => (
                    <button key={opt} onClick={() => setQtAnswers(p => ({ ...p, [q.id]: opt }))}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        qtAnswers[q.id] === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>
                      {opt === 'yes' ? (locale === 'fr' ? 'Oui' : locale === 'ar' ? 'نعم' : 'Yes') : (locale === 'fr' ? 'Non' : locale === 'ar' ? 'لا' : 'No')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(qtAnswers).length === 3 && (
              <div className={`rounded-xl p-3 text-sm font-medium ${yesCount >= 2 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                {yesCount >= 2
                  ? (locale === 'fr' ? '✅ Oui, un site web va clairement vous aider ! Construisez-le ci-dessous.' : locale === 'ar' ? '✅ نعم، الموقع سيساعدك بوضوح! ابنِه بالأسفل.' : '✅ Yes, a website will clearly help you! Build it below.')
                  : (locale === 'fr' ? '💡 Un site pourrait quand même vous faire gagner du temps et de la crédibilité.' : locale === 'ar' ? '💡 الموقع قد يوفر وقتك ويضيف مصداقية.' : '💡 A website could still save you time and add credibility.')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SITE TYPE header + base price */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-400 mb-1">
              {locale === 'fr' ? 'Votre choix' : locale === 'ar' ? 'اختيارك' : 'Your choice'}
            </p>
            <h2 className="text-2xl font-bold mb-2">{pick(st.name)}</h2>
            <p className="text-sm text-slate-300 max-w-xl">{pick(st.why)}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-400 mb-0.5">
              {locale === 'fr' ? 'Prix de base' : locale === 'ar' ? 'السعر الأساسي' : 'Base price'}
            </p>
            <p className="text-3xl font-bold text-blue-400">{st.basePrice.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
          {st.included.map((inc, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3 text-green-400" /> {pick(inc)}
            </span>
          ))}
        </div>
      </div>

      {/* BUILDER: catalog + cart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* CATALOG */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={locale === 'fr' ? 'Rechercher une fonctionnalité...' : locale === 'ar' ? 'ابحث عن ميزة...' : 'Search features...'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>

          {/* category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  cat === c.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {pick(c.label)}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {locale === 'fr' ? '💡 Ajoutez ce dont vous avez besoin — les prix s\u2019affichent dans le panier' : locale === 'ar' ? '💡 أضف ما تحتاجه — تظهر الأسعار في السلة' : '💡 Add what you need — prices appear in the cart'}
          </p>

          {/* feature cards */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {available.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">
                {locale === 'fr' ? 'Aucun résultat' : locale === 'ar' ? 'لا نتائج' : 'No results'}
              </p>
            )}
            {available.map(f => {
              const isSelected = selected.find(s => s.id === f.id);
              return (
                <div key={f.id} draggable={!isSelected}
                  onDragStart={e => { e.dataTransfer.setData('featureId', f.id); e.dataTransfer.effectAllowed = 'copy'; }}
                  onClick={() => !isSelected && add(f)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected ? 'bg-blue-50 border-blue-300 opacity-60 cursor-default' : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}>
                  <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 text-sm truncate">{pick(f.name)}</p>
                      {f.popular && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                        {locale === 'fr' ? 'populaire' : locale === 'ar' ? 'شائع' : 'popular'}</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{pick(f.desc)}</p>
                  </div>
                  {f.timeDays > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />{f.timeDays}j
                    </span>
                  )}

                  <button onClick={(e) => { e.stopPropagation(); add(f); }} disabled={!!isSelected}
                    className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-40">
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <span className="text-lg leading-none">+</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CART */}
        <div className="lg:col-span-2">
          <div
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const id = e.dataTransfer.getData('featureId'); const f = FEATURES.find(x => x.id === id); if (f) add(f); }}
            className={`bg-white rounded-2xl border-2 p-5 transition-colors sticky top-20 ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">
                {locale === 'fr' ? 'Votre Build' : locale === 'ar' ? 'بنائك' : 'Your Build'}
              </h3>
              <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{selected.length}</span>
            </div>

            <div className="space-y-2 mb-4 min-h-[60px]">
              {selected.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                  {locale === 'fr' ? 'Déposez des fonctionnalités ici' : locale === 'ar' ? 'أسقط الميزات هنا' : 'Drop features here'}
                </p>
              )}
              {selected.map(f => (
                <div key={f.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm text-slate-700 truncate">{pick(f.name)}</span>
                  <span className="text-sm font-semibold text-blue-600">{f.price}</span>
                  <button onClick={() => remove(f.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* totals */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{pick(st.name)} ({locale === 'fr' ? 'base' : locale === 'ar' ? 'أساسي' : 'base'})</span>
                <span>{st.basePrice.toLocaleString()}</span>
              </div>
              {selected.map(f => (
                <div key={f.id} className="flex justify-between text-slate-500 text-xs">
                  <span className="truncate mr-2">{pick(f.name)}</span>
                  <span className="flex-shrink-0">+{f.price}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-slate-900 text-lg pt-2 border-t border-slate-200">
                <span>TOTAL</span>
                <span className="text-blue-600">{total.toLocaleString()}</span>
              </div>
              {totalTime > 0 && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {locale === 'fr' ? `~${totalTime + 7} jours de livraison` : locale === 'ar' ? `~${totalTime + 7} أيام للتسليم` : `~${totalTime + 7} days delivery`}
                </p>
              )}
            </div>

            {/* contact + submit */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
              <input required value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
                placeholder={locale === 'fr' ? 'Votre nom *' : locale === 'ar' ? 'اسمك *' : 'Your name *'}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <input required type="email" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                placeholder={locale === 'fr' ? 'Votre email *' : locale === 'ar' ? 'بريدك *' : 'Your email *'}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <input type="tel" value={contact.phone} onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                placeholder={locale === 'fr' ? 'Téléphone' : locale === 'ar' ? 'الهاتف' : 'Phone'}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              <button type="submit" disabled={submitting || !contact.name || !contact.email}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting
                  ? (locale === 'fr' ? 'Envoi...' : locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...')
                  : (locale === 'fr' ? 'Recevoir mon devis' : locale === 'ar' ? 'احصل على عرض السعر' : 'Get my quote')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}