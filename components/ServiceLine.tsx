import {
  Globe, Code2, ShoppingCart, Layout, Database, Palette, Search, Wrench
} from 'lucide-react';

const services = [
  { icon: Globe, label: 'Sites vitrine' },
  { icon: Code2, label: 'Apps web' },
  { icon: ShoppingCart, label: 'E-commerce' },
  { icon: Layout, label: 'Landing pages' },
  { icon: Database, label: 'CMS' },
  { icon: Palette, label: 'UI/UX' },
  { icon: Search, label: 'SEO' },
  { icon: Wrench, label: 'Maintenance' },
];

function ServiceItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 md:px-10 flex-shrink-0 w-[110px] md:w-[140px]">
      <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
      <span className="text-[10px] md:text-xs font-light tracking-[0.15em] uppercase text-center whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function ServiceLine() {
  const set = services.concat(services); // dupliqué pour boucle seamless
  return (
    <div className="marquee overflow-hidden py-2">
      <div className="marquee-track text-white/80">
        {set.map((s, i) => <ServiceItem key={i} icon={s.icon} label={s.label} />)}
      </div>
    </div>
  );
}