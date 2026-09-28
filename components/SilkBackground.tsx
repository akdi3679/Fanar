"use client";
import { useEffect, useRef } from 'react';

export default function SilkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current; 
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => { 
      canvas.width = window.innerWidth * dpr; 
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      ctx.scale(dpr, dpr);
      const gradient = ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
      gradient.addColorStop(0, '#00001a');
      gradient.addColorStop(0.5, '#0a0a3f');
      gradient.addColorStop(1, '#00001a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }

    let time = 0;
    const speed = 0.015;
    const scale = 1.6;
    const noiseIntensity = 0.6;

    const noise = (x: number, y: number) => {
      const G = 2.71828;
      return (G * Math.sin(G * x) * G * Math.sin(G * y) * (1 + x)) % 1;
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.save();
      ctx.scale(dpr, dpr);

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#00001a');
      gradient.addColorStop(0.5, '#0a0a3f');
      gradient.addColorStop(1, '#00001a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      const tOffset = speed * time;

      for (let x = 0; x < w; x += 2) {
        for (let y = 0; y < h; y += 2) {
          const u = (x / w) * scale;
          const v = (y / h) * scale;
          const tex_x = u;
          const tex_y = v + 0.03 * Math.sin(8.0 * tex_x - tOffset);

          const pattern = 0.6 + 0.4 * Math.sin(
            5.0 * (tex_x + tex_y + Math.cos(3.0 * tex_x + 5.0 * tex_y) + 0.02 * tOffset) +
            Math.sin(20.0 * (tex_x + tex_y - 0.1 * tOffset))
          );

          const rnd = noise(x, y);
          const intensity = Math.max(0, pattern - rnd / 15.0 * noiseIntensity);

          const index = (y * w + x) * 4;
          if (index < data.length) {
            data[index]     = Math.floor(20 * intensity);
            data[index + 1] = Math.floor(20 * intensity);
            data[index + 2] = Math.floor(220 * intensity);
            data[index + 3] = 255;
          }
        }
      }
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.putImageData(imageData, 0, 0);
      ctx.restore();

      const rg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/2);
      rg.addColorStop(0, 'rgba(0,0,0,0.05)');
      rg.addColorStop(1, 'rgba(0,0,31,0.5)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="silk-canvas" aria-hidden="true" />;
}
