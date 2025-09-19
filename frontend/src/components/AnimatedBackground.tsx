"use client";

import { useEffect, useRef } from "react";

// Simple, performant animated background with floating particles and subtle connections.
// Designed to sit behind page content (positioned fixed, pointer-events none).
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    // Colors (high-contrast friendly yet subtle)
    const BG = "#ffffff"; // matches globals.css
    const DOT = "#cbd5e1"; // slate-300
    const LINE = "#e5e7eb"; // gray-200

    let width = 0;
    let height = 0;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    type Particle = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: Particle[] = [];
    const MAX_PARTICLES = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    const MAX_DIST = 110; // connection distance in px

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-seed particles when resizing significantly
      seedParticles();
    }

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function seedParticles() {
      const count = MAX_PARTICLES;
      particles = new Array(count).fill(0).map(() => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.25, 0.25),
        r: rand(1.1, 2.2),
      }));
    }

    function step() {
      // Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, width, height);

      // Update & draw particles
      ctx.fillStyle = DOT;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connections (subtle)
      ctx.strokeStyle = LINE;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            const alpha = 1 - dist / MAX_DIST;
            ctx.globalAlpha = Math.min(0.45, alpha * 0.45);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    step();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
