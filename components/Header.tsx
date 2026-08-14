export default function Header() {
  return (
    <header className="absolute top-0 inset-x-0 z-50 px-6 py-5 md:px-10 md:py-7 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium tracking-[0.28em] uppercase text-white/70">Fanar</span>
        <span className="text-[10px] text-white/40 tracking-wider">· studio web</span>
      </div>
      <a
        href="mailto:fanar.link@gmail.com"
        className="text-xs md:text-sm font-light text-white/70 hover:text-white transition-colors"
      >
        fanar.link@gmail.com
      </a>
    </header>
  );
}