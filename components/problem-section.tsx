"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Clock, AlertTriangle, TrendingDown } from "lucide-react";
import {
  animateSectionHeader,
  cardTiltOnMove,
  cardTiltReset,
  registerGsapScroll,
} from "@/lib/gsap-section";

const problems = [
  {
    icon: Clock,
    title: "El tiempo se va en lo urgente, no en lo importante",
    description:
      "Llamadas, correos, incidencias, comunicaciones, busquedas y un sin fin de gestiones que se repiten. El equipo talentoso queda anclado a tareas que cualquier operador podría cerrar si el flujo estuviera resuelto.",
  },
  {
    icon: AlertTriangle,
    title: "Cuando sube el volumen, algo se queda atrás",
    description:
      "Pedidos, presupuestos o clientes esperando respuesta. No es mala voluntad: es falta de capacidad continua. El negocio pierde ventas y reputación.",
  },
  {
    icon: TrendingDown,
    title: "Intervencion humana donde realmente se necesita",
    description:
      "Si cada euro de facturación exige más cabezas haciendo lo mismo, el margen no escala. Hace falta una capa que ejecute procesos de punta a punta, con supervisión humana donde importa.",
  },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapScroll();
    const ctx = gsap.context(() => {
      animateSectionHeader(headerRef.current);

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".problem-card");
        const icons = cardsRef.current.querySelectorAll(".problem-icon");

        gsap.fromTo(
          cards,
          { opacity: 0, y: 56, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.14,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );

        gsap.fromTo(
          icons,
          { scale: 0, rotation: -12 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.55,
            stagger: 0.14,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      if (bottomRef.current) {
        gsap.fromTo(
          bottomRef.current,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bottomRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );

        const highlight = bottomRef.current.querySelector(".problem-highlight");
        if (highlight) {
          gsap.fromTo(
            highlight,
            { opacity: 0, scale: 0.92 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: "back.out(1.6)",
              scrollTrigger: {
                trigger: bottomRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              delay: 0.25,
            },
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="reto" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center">
          <span className="section-label text-sm font-medium uppercase tracking-wider text-primary">
            Pero, ¿Que sucede en las empresas que carecen de este concepto?
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-balance">
              Lo que ves en muchas pymes o empresas medianas
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-balance text-lg text-muted-foreground">
            Tenemos actualmente dos retos: falta de digitalización y trabajo
            real que hoy consume horas y que podría ejecutarse solo, con reglas
            claras y conexión a los sistemas con las que trabajan a diario.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{ perspective: "1000px" }}
        >
          {problems.map((problem, index) => (
            <div
              key={index}
              className="problem-card group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
              style={{ transformStyle: "preserve-3d" }}
              onMouseMove={cardTiltOnMove}
              onMouseLeave={(e) => cardTiltReset(e.currentTarget)}
            >
              <div className="problem-icon mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>

              <h3 className="text-xl font-semibold">{problem.title}</h3>
              <p className="mt-3 text-muted-foreground">
                {problem.description}
              </p>

              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>

        <div ref={bottomRef} className="mt-16 text-center">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm">
            <p className="text-xl font-medium text-muted-foreground">
              El software habitual{" "}
              <span className="text-foreground">registra y archiva</span>. Lo
              que falta es algo que{" "}
              <span className="text-foreground">avance el proceso</span> sin
              depender de que alguien esté delante del teclado.
            </p>
            <p className="problem-highlight mt-2 text-2xl font-bold text-primary">
              Ahí es donde encaja Cognitfy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
