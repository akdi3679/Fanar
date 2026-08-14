import { Mail } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer className="absolute bottom-0 inset-x-0 z-50 px-6 py-5 md:px-10 md:py-7 flex items-center justify-between">
      <a
        href="https://www.instagram.com/fanar.studio/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <InstagramIcon className="w-4 h-4" />
        <span className="text-xs font-light tracking-wider hidden sm:inline">@fanar.studio</span>
      </a>
      <p className="text-[10px] md:text-xs text-white/40 tracking-[0.2em] uppercase font-light">
        Fanar — le phare
      </p>
      <a
        href="mailto:fanar.link@gmail.com"
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <Mail className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-xs font-light tracking-wider hidden sm:inline">Contact</span>
      </a>
    </footer>
  );
}