"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
}

const PARTICLE_COUNT = 35;
const CONNECTION_DISTANCE = 100;
const BRAND_GREEN = { r: 13, g: 223, b: 114 };
const EDGE_MARGIN = 10;

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio;
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const { w, h } = sizeRef.current;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: EDGE_MARGIN + Math.random() * (w - EDGE_MARGIN * 2),
        y: EDGE_MARGIN + Math.random() * (h - EDGE_MARGIN * 2),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.3 + 0.15,
        pulseSpeed: Math.random() * 0.008 + 0.004,
        pulseOffset: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time: number) => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update positions — soft bounce off edges
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= EDGE_MARGIN || p.x >= w - EDGE_MARGIN) {
          p.vx *= -1;
          p.x = Math.max(EDGE_MARGIN, Math.min(w - EDGE_MARGIN, p.x));
        }
        if (p.y <= EDGE_MARGIN || p.y >= h - EDGE_MARGIN) {
          p.vy *= -1;
          p.y = Math.max(EDGE_MARGIN, Math.min(h - EDGE_MARGIN, p.y));
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${BRAND_GREEN.r}, ${BRAND_GREEN.g}, ${BRAND_GREEN.b}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset);
        const currentOpacity = p.opacity + pulse * 0.1;
        const currentRadius = p.radius + pulse * 0.3;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, currentRadius * 3
        );
        gradient.addColorStop(0, `rgba(${BRAND_GREEN.r}, ${BRAND_GREEN.g}, ${BRAND_GREEN.b}, ${currentOpacity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(${BRAND_GREEN.r}, ${BRAND_GREEN.g}, ${BRAND_GREEN.b}, ${currentOpacity * 0.08})`);
        gradient.addColorStop(1, `rgba(${BRAND_GREEN.r}, ${BRAND_GREEN.g}, ${BRAND_GREEN.b}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.fillStyle = `rgba(${BRAND_GREEN.r}, ${BRAND_GREEN.g}, ${BRAND_GREEN.b}, ${currentOpacity})`;
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      initParticles();
    };

    resize();
    initParticles();
    animFrameRef.current = requestAnimationFrame(draw);

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
