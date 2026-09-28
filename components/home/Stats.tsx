"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/home/Reveal";

function Counter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function Stats() {
  const t = useTranslations("stats");
  const items = [
    { value: 2.3, suffix: "s", decimals: 1, label: t("speed"), color: "from-blue-400 to-cyan-400" },
    { value: 147, prefix: "+", suffix: "%", decimals: 0, label: t("conversion"), color: "from-purple-400 to-pink-400" },
    { value: 0, prefix: "", decimals: 0, label: t("security"), color: "from-green-400 to-emerald-400" },
    { value: 30, suffix: "s", decimals: 0, label: t("time"), color: "from-amber-400 to-orange-400" },
  ];

  return (
    <section className="relative py-20 px-6 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-center text-xs uppercase tracking-[0.3em] text-white/40 mb-12">{t("title")}</p>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className={`text-4xl md:text-5xl font-light bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  <Counter value={item.value} prefix={item.prefix} suffix={item.suffix} decimals={item.decimals} />
                </div>
                <p className="mt-3 text-xs md:text-sm text-white/50">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
