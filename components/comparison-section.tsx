"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Check, X } from "lucide-react";
import {
  animateSectionHeader,
  registerGsapScroll,
} from "@/lib/gsap-section";

const comparison = {
  others: [
    "Parches: solo una parte del proceso",
    "Asistentes que responden pero no cierran",
    "Meses de proyecto antes de ver nada en producción",
    "Otro proveedor que no conoce su operación",
    "Promesas genéricas de “IA” sin responsable",
    "Carencia total de garantías post-venta",
    "Ciberseguridad Nula",
  ],
  cognitfy: [
    "Procesos de principio a fin, conectados y alineados con el negocio",
    "Acciones reales: tareas, avisos, cobros, seguimiento…",
    "Enfoque en resultados y continuidad 24/7",
    "Puesta en marcha guiada en pocas semanas",
    "Equipo que implementa y acompaña",
    "Modelo alineado con valor (demo y fases claras)",
    "Garantías post-venta",
    "Ciberseguridad y cumplimiento normativo",
  ],
};

export function ComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    registerGsapScroll();
    const ctx = gsap.context(() => {
      animateSectionHeader(headerRef.current);

      if (gridRef.current) {
        const othersCol = gridRef.current.querySelector(".compare-others");
        const cognitfyCol = gridRef.current.querySelector(".compare-cognitfy");
        const othersItems = othersCol?.querySelectorAll(".compare-item");
        const cognitfyItems = cognitfyCol?.querySelectorAll(".compare-item");

        if (othersCol) {
          gsap.fromTo(
            othersCol,
            { opacity: 0, x: -64, rotateY: 8 },
            {
              opacity: 1,
              x: 0,
              rotateY: 0,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 78%",
                toggleActions: "play none none none",
              },
            },
          );
        }

        if (cognitfyCol) {
          gsap.fromTo(
            cognitfyCol,
            { opacity: 0, x: 64, rotateY: -8 },
            {
              opacity: 1,
              x: 0,
              rotateY: 0,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 78%",
                toggleActions: "play none none none",
              },
              delay: 0.12,
            },
          );
        }

        if (othersItems?.length) {
          gsap.fromTo(
            othersItems,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 75%",
                toggleActions: "play none none none",
              },
              delay: 0.2,
            },
          );
        }

        if (cognitfyItems?.length) {
          gsap.fromTo(
            cognitfyItems,
            { opacity: 0, x: 20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 75%",
                toggleActions: "play none none none",
              },
              delay: 0.32,
            },
          );
        }
      }

      if (noteRef.current) {
        gsap.fromTo(
          noteRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: noteRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute right-0 top-1/4">
        <div className="h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center">
          <span className="section-label text-sm font-medium uppercase tracking-wider text-primary">
            Propuesta de valor
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-balance">
              Ingeniería de vanguardia alcanzable
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-balance text-lg text-muted-foreground">
            Sin tecnicismos: Cognitfy convierte trabajo repetitivo en flujo
            automático, con supervisión donde hace falta y visibilidad para
            dirección y ventas.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-16 grid gap-8 lg:grid-cols-2"
          style={{ perspective: "1200px" }}
        >
          <div className="compare-others rounded-2xl border border-border bg-card/50 p-8">
            <h3 className="mb-6 text-center text-xl font-semibold text-muted-foreground">
              Lo que suele frustrar al comprador
            </h3>
            <ul className="space-y-4">
              {comparison.others.map((item, index) => (
                <li key={index} className="compare-item flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="compare-cognitfy rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card p-8">
            <h3 className="mb-6 text-center text-xl font-semibold text-primary">
              Lo que ofrece Cognitfy
            </h3>
            <ul className="space-y-4">
              {comparison.cognitfy.map((item, index) => (
                <li key={index} className="compare-item flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p
          ref={noteRef}
          className="mt-12 text-center text-muted-foreground"
        >
          La tecnología concreta (modelos, conectores, seguridad) se elige según
          cada cliente: velocidad, coste, privacidad y normativa. Tú no tienes
          que explicar motores; sí el beneficio — tiempo, continuidad y control.
        </p>
      </div>
    </section>
  );
}
