"use client";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const t = useTranslations("Home.footer");
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/fanar.studio/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-slate-700 transition-colors">
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a href="mailto:fanar.link@gmail.com" aria-label="Email" className="text-slate-400 hover:text-slate-700 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-sm text-slate-500 text-center">{t("tagline")}</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="/mentions-legales" className="hover:text-slate-900 transition-colors">{t("legal")}</a>
            <a href="/politique-confidentialite" className="hover:text-slate-900 transition-colors">{t("privacy")}</a>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
          © {new Date().getFullYear()} Fanar Studio. {t("rights")}
        </p>
      </div>
    </footer>
  );
}