"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const OPENTYPE_CDN = "https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js";
const DEFAULT_FONT_URL =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/kalam/Kalam-Regular.ttf";

// Scripts the handwriting font cannot render -> graceful fade-in fallback
const FALLBACK_SCRIPT = /[\u0600-\u06FF\u0590-\u05FF\u0700-\u074F\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/;

export interface HandwritingTextProps {
  text?: string;
  words?: string[];
  interval?: number;
  fontUrl?: string;
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  fill?: boolean;
  height?: string;
  className?: string;
}

type Geometry = { full: string; contours: string[]; x: number; y: number; w: number; h: number };

let libPromise: Promise<any> | null = null;
function loadOpentype(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const existing = (window as any).opentype;
  if (existing) return Promise.resolve(existing);
  if (!libPromise) {
    libPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = OPENTYPE_CDN;
      script.async = true;
      script.onload = () => {
        const lib = (window as any).opentype;
        if (lib) resolve(lib); else reject(new Error("opentype.js exposed nothing"));
      };
      script.onerror = () => reject(new Error("opentype.js failed"));
      document.head.appendChild(script);
    });
  }
  return libPromise;
}

const fontCache = new Map<string, Promise<any>>();
function loadFont(url: string): Promise<any> {
  let pending = fontCache.get(url);
  if (!pending) {
    pending = Promise.all([
      loadOpentype(),
      fetch(url).then((res) => {
        if (!res.ok) throw new Error("Font failed: " + res.status);
        return res.arrayBuffer();
      }),
    ]).then(([lib, buffer]) => lib.parse(buffer));
    fontCache.set(url, pending);
  }
  return pending;
}

const EM = 100;

export function HandwritingText({
  text, words, interval = 3200, fontUrl = DEFAULT_FONT_URL,
  duration = 1.5, delay = 0.05, strokeWidth = 1.6, fill = true,
  height = "1.15em", className,
}: HandwritingTextProps) {
  const cycle = Boolean(words && words.length > 0);
  const [index, setIndex] = useState(0);
  const current = cycle ? words![index % words!.length] : text ?? "";

  // Arabic / other non-Latin scripts: the handwriting font has no glyphs for them,
  // so fall back to a smooth fade-in of the plain text.
  const needsFallback = FALLBACK_SCRIPT.test(current);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (needsFallback) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    }
  }, [needsFallback, current]);

  const [font, setFont] = useState<any>(null);
  const [geom, setGeom] = useState<Geometry | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [lengths, setLengths] = useState<number[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!cycle) return undefined;
    const id = setInterval(() => setIndex((i) => i + 1), interval);
    return () => clearInterval(id);
  }, [cycle, interval]);

  useEffect(() => {
    if (needsFallback) return;
    let cancelled = false;
    loadFont(fontUrl)
      .then((f) => { if (!cancelled) setFont(f); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [fontUrl, needsFallback]);

  useEffect(() => {
    if (!font || !current || needsFallback) return;
    try {
      const path = font.getPath(current, 0, EM, EM);
      const box = path.getBoundingBox();
      const pad = EM * 0.12;
      const full = path.toPathData(2);
      setGeom({
        full,
        contours: full.split(/(?=M)/).filter((d: string) => d.trim().length > 1),
        x: box.x1 - pad, y: box.y1 - pad,
        w: box.x2 - box.x1 + pad * 2, h: box.y2 - box.y1 + pad * 2,
      });
      setDrawn(false);
      setLengths([]);
    } catch { /* fallback below */ }
  }, [font, current, needsFallback]);

  useEffect(() => {
    if (!geom) return undefined;
    setLengths(pathRefs.current.slice(0, geom.contours.length).map((el) => (el ? el.getTotalLength() : 0)));
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, [geom]);

  // FALLBACK for Arabic & other scripts: simple fade-in, always readable
  if (needsFallback || !geom) {
    return (
      <span
        className={cn("inline-block", className)}
        style={{
          opacity: needsFallback ? (visible ? 1 : 0) : 1,
          transform: needsFallback ? (visible ? "translateY(0)" : "translateY(8px)") : "none",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {current}
      </span>
    );
  }

  const count = Math.max(1, geom.contours.length);

  return (
    <svg
      key={current}
      viewBox={`${geom.x} ${geom.y} ${geom.w} ${geom.h}`}
      role="img"
      aria-label={current}
      className={cn("inline-block", className)}
      style={{ height, width: `calc(${height} * ${(geom.w / geom.h).toFixed(4)})`, overflow: "visible" }}
    >
      {fill && (
        <path
          d={geom.full}
          fill="currentColor"
          stroke="none"
          style={{
            opacity: drawn ? 1 : 0,
            transition: drawn ? `opacity 0.45s ease-out ${(delay + duration * 0.72).toFixed(3)}s` : "none",
          }}
        />
      )}
      {geom.contours.map((d, i) => {
        const length = lengths[i] || 0;
        const each = (duration / count) * 2.4;
        const start = delay + (i / count) * duration;
        return (
          <path
            key={i}
            ref={(el) => { pathRefs.current[i] = el; }}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: length || 1,
              strokeDashoffset: drawn ? 0 : length || 1,
              transition: drawn ? `stroke-dashoffset ${each.toFixed(3)}s ease-out ${start.toFixed(3)}s` : "none",
            }}
          />
        );
      })}
    </svg>
  );
}

export default HandwritingText;