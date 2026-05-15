"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Vec3 = { x: number; y: number; z: number };

function fibonacciSphere(count: number): Vec3[] {
  const pts: Vec3[] = [];
  const offset = 2 / count;
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * inc;
    pts.push({ x: Math.cos(phi) * r, y, z: Math.sin(phi) * r });
  }
  return pts;
}

function rotateY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

function rotateX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function dot(a: Vec3, b: Vec3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function buildEdges(points: Vec3[], neighbors: number): [number, number][] {
  const edges = new Set<string>();
  const out: [number, number][] = [];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = 1 - dot(points[i], points[j]);
      dists.push({ j, d });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let k = 0; k < neighbors && k < dists.length; k++) {
      const j = dists[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edges.has(key)) {
        edges.add(key);
        out.push([i, j]);
      }
    }
  }
  return out;
}

type HeroNodeGlobeProps = {
  className?: string;
};

export function HeroNodeGlobe({ className }: HeroNodeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const NODE_COUNT = 96;
    const NEIGHBORS = 4;
    const basePoints = fibonacciSphere(NODE_COUNT);
    const edges = buildEdges(basePoints, NEIGHBORS);

    let raf = 0;
    let t = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement ?? canvas);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.42;

      const ry = reduced ? 0.6 : t * 0.35;
      const rx = reduced ? 0.25 : t * 0.12;

      const projected: { x: number; y: number; z: number; i: number }[] = [];
      for (let i = 0; i < basePoints.length; i++) {
        let p = basePoints[i];
        p = rotateY(p, ry);
        p = rotateX(p, rx);
        const perspective = 1.8 / (2.2 - p.z);
        projected.push({
          x: cx + p.x * scale * perspective,
          y: cy + p.y * scale * perspective,
          z: p.z,
          i,
        });
      }

      const pulse = (i: number) => 0.55 + 0.45 * Math.sin(t * 1.4 + i * 0.37);
      const lineAlpha = (z: number) => 0.06 + 0.14 * ((z + 1) / 2);
      const nodeAlpha = (z: number) => 0.25 + 0.55 * ((z + 1) / 2);

      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        if (pa.z < -0.15 && pb.z < -0.15) continue;
        const z = Math.min(pa.z, pb.z);
        ctx.strokeStyle = `rgba(120, 200, 255, ${lineAlpha(z)})`;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      const nodesByZ = [...projected].sort((p, q) => p.z - q.z);
      for (const p of nodesByZ) {
        const alpha = nodeAlpha(p.z) * pulse(p.i);
        const r = (p.z + 1) * 1.1 + 1.2;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        g.addColorStop(0, `rgba(0, 245, 255, ${alpha})`);
        g.addColorStop(0.45, `rgba(100, 200, 255, ${alpha * 0.35})`);
        g.addColorStop(1, "rgba(0, 200, 255, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(220, 250, 255, ${Math.min(1, alpha + 0.25)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!reduced) t += 0.008;
      draw();
      raf = requestAnimationFrame(loop);
    };

    draw();
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative h-full min-h-[280px] w-full", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        aria-hidden
      />
    </div>
  );
}
