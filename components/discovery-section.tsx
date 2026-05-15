"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, Play, FileText } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Descubrimiento (~60 min)",
    description:
      "Se identifican las tareas que más tiempo roban y las que más margen sueltan. Salida: mapa claro de qué automatizar y por qué.",
  },
  {
    number: "02",
    icon: Play,
    title: "Demo acotada a su mundo",
    description:
      "Se enseña un flujo reconocible para su sector — no una diapositiva genérica. El cliente ve el antes/después de manera clara.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Siguiente paso comercial claro",
    description:
      "Alcance, calendario y forma de medir impacto. Tú llevas una propuesta creíble; nosotros nos encargamos de la implementación.",
  },
];

export function DiscoverySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%",
        },
      });

      headerTl
        .fromTo(
          headerRef.current?.querySelector("span"),
          { opacity: 0, y: 20, letterSpacing: "0.3em" },
          { opacity: 1, y: 0, letterSpacing: "0.05em", duration: 0.6 },
        )
        .fromTo(
          headerRef.current?.querySelector("h2"),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" },
          "-=0.3",
        )
        .fromTo(
          headerRef.current?.querySelector("p"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4",
        );

      // Steps animation with connecting line
      if (stepsRef.current) {
        const stepCards = stepsRef.current.querySelectorAll(".step-card");
        const stepNumbers = stepsRef.current.querySelectorAll(".step-number");
        const connectors = stepsRef.current.querySelectorAll(".step-connector");

        // Animate cards with stagger
        gsap.fromTo(
          stepCards,
          {
            opacity: 0,
            y: 80,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 80%",
            },
          },
        );

        // Step numbers bounce in
        gsap.fromTo(
          stepNumbers,
          { scale: 0, rotation: -180 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 75%",
            },
          },
        );

        // Connector lines draw in
        connectors.forEach((connector, index) => {
          gsap.fromTo(
            connector,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: 0.5,
              delay: 0.3 + index * 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: stepsRef.current,
                start: "top 75%",
              },
            },
          );
        });

        // Icon pulse animation
        stepCards.forEach((card) => {
          const icon = card.querySelector(".step-icon");
          gsap.fromTo(
            icon,
            { scale: 0.5, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
              },
            },
          );
        });
      }

      // CTA card animation
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
        },
      });

      ctaTl.fromTo(
        ctaRef.current,
        {
          opacity: 0,
          y: 60,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
        },
      );

      // Floating glow animation on CTA
      if (ctaRef.current) {
        const glows = ctaRef.current.querySelectorAll(".cta-glow");
        glows.forEach((glow, index) => {
          gsap.to(glow, {
            x: index === 0 ? 30 : -30,
            y: index === 0 ? -20 : 20,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Hover effect for step cards
  const handleStepHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      y: -5,
      boxShadow: "0 20px 40px rgba(0,245,255,0.15)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleStepLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      y: 0,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.4,
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="descubrimiento"
      className="relative py-24 sm:py-32"
    >
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute right-0 top-0">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px]" />
      </div>
      <div className="absolute bottom-0 left-0">
        <div className="h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center">
          <span className="inline-block text-sm font-medium uppercase tracking-wider text-primary">
            Metodología de trabajo
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-balance">Sesiones de descubrimiento</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-balance text-lg text-muted-foreground">
            Pensadas para dirección o responsables de operación: poco tiempo,
            lenguaje de negocio y una línea clara hacia demo o propuesta. Tú
            posicionas; el equipo Cognitfy cierra el detalle técnico y de
            implementación.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="step-card group relative"
              onMouseEnter={handleStepHover}
              onMouseLeave={handleStepLeave}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="step-connector absolute left-1/2 top-16 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent md:block" />
              )}

              <div className="relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50">
                {/* Step number */}
                <div className="step-number absolute -top-4 left-8 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="step-icon mb-6 mt-2 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div ref={ctaRef} className="mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-accent/10 p-8 sm:p-12">
            {/* Animated Glow */}
            <div className="cta-glow absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
            <div className="cta-glow absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl" />

            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-primary/40"
                  style={{
                    left: `${10 + i * 12}%`,
                    top: `${20 + (i % 3) * 30}%`,
                    animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center lg:text-left">
              <div className="max-w-2xl lg:max-w-none">
                <h3 className="text-2xl font-bold sm:text-3xl">
                  El mercado pide continuidad y velocidad
                </h3>
                <p className="mt-4 text-lg text-muted-foreground">
                  Cognitfy responde con implementación guiada, integraciones con
                  lo que ya usan y un modelo donde el cliente ve el valor de la
                  solución de extremo a extremo.{" "}
                  <span className="font-semibold text-primary">
                    Dedica tu tiempo al crecimiento estrategico.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust statement */}
        <p
          className="mt-12 text-center text-sm text-muted-foreground opacity-0"
          style={{ animation: "fadeInUp 0.6s ease-out 0.5s forwards" }}
        >
          Un asistente genérico responde mensajes.{" "}
          <span className="font-medium text-foreground">
            Pero COGNITFY ejecuta e informa continuamente.
          </span>
        </p>
      </div>
    </section>
  );
}
