"use client";
import { useEffect, useRef } from 'react';

export default function SilkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
const animationRef = useRef<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    let time = 0;
    const speed = 0.015;          // vitesse d'origine
    const scale = 1.6;            // ← plus large que l'original (2) mais moins que 1.1
    const noiseIntensity = 0.6;   // ← atténué (était 0.8, ma dernière version 0.4)

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const noise = (x: number, y: number) => {
      const G = 2.71828;
      return (G * Math.sin(G * x) * G * Math.sin(G * y) * (1 + x)) % 1;
    };

    const animate = () => {
      const { width, height } = canvas;

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#00001a');
      gradient.addColorStop(0.5, '#0a0a3f');
      gradient.addColorStop(1, '#00001a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      const tOffset = speed * time;

      for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
          const u = (x / width) * scale;
          const v = (y / height) * scale;
          const tex_x = u;
          const tex_y = v + 0.03 * Math.sin(8.0 * tex_x - tOffset);

          // Motif d'origine (plis nets) — juste atténués
          const pattern = 0.6 + 0.4 * Math.sin(
            5.0 * (tex_x + tex_y + Math.cos(3.0 * tex_x + 5.0 * tex_y) + 0.02 * tOffset) +
            Math.sin(20.0 * (tex_x + tex_y - 0.1 * tOffset))
          );

          const rnd = noise(x, y);
          const intensity = Math.max(0, pattern - rnd / 15.0 * noiseIntensity);

          const index = (y * width + x) * 4;
          if (index < data.length) {
            data[index]     = Math.floor(20 * intensity);
            data[index + 1] = Math.floor(20 * intensity);
            data[index + 2] = Math.floor(220 * intensity);
            data[index + 3] = 255;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);

      const rg = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width,height)/2);
      rg.addColorStop(0, 'rgba(0,0,0,0.05)');
      rg.addColorStop(1, 'rgba(0,0,31,0.5)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, width, height);

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