"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(() => router.replace(pathname, { locale: next }));
  }

  return (
    <div className="relative flex items-center">
      <Globe className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
      <select
        defaultValue={locale}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Change language"
        className="appearance-none pl-9 pr-8 py-2 text-sm rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}