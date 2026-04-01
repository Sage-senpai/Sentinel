'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const COLS = Math.ceil(width / 80) + 1;
    const ROWS = Math.ceil(height / 80) + 1;
    const SPACING = 80;
    const CONNECTION_DIST = 140;
    const MOUSE_RADIUS = 200;
    const PARALLAX_STRENGTH = 20;

    const points: Point[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * SPACING;
        const y = row * SPACING;
        const z = Math.random() * 0.5 + 0.5;
        points.push({
          x, y, z,
          ox: x, oy: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let time = 0;

    function animate() {
      if (!ctx) return;
      time += 0.003;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update points
      for (const p of points) {
        // Gentle drift
        p.x = p.ox + Math.sin(time + p.ox * 0.01) * 8;
        p.y = p.oy + Math.cos(time + p.oy * 0.01) * 8;

        // Mouse parallax — depth-based
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * PARALLAX_STRENGTH * p.z;
          p.x += (dx / dist) * force * 0.08;
          p.y += (dy / dist) * force * 0.08;
        }
      }

      // Draw connections
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12 * ((a.z + b.z) / 2);

            // Mouse proximity boost
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const mouseDist = Math.sqrt((mx - midX) ** 2 + (my - midY) ** 2);
            const boost = mouseDist < MOUSE_RADIUS ? (1 - mouseDist / MOUSE_RADIUS) * 0.15 : 0;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 102, 255, ${alpha + boost})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw points
      for (const p of points) {
        const pdist = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
        const glow = pdist < MOUSE_RADIUS ? (1 - pdist / MOUSE_RADIUS) * 0.6 : 0;
        const radius = 1 + p.z * 1.5 + glow * 2;
        const alpha = 0.15 + p.z * 0.2 + glow;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = glow > 0.1
          ? `rgba(0, 212, 170, ${alpha})`
          : `rgba(0, 102, 255, ${alpha})`;
        ctx.fill();

        // Glow halo on hover
        if (glow > 0.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 170, ${glow * 0.15})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    // Respect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches) {
      animate();
    } else {
      // Draw one static frame
      animate();
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
