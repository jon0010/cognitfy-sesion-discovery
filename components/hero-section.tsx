"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroNodeGlobe } from "@/components/hero-node-globe";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial timeline for hero elements
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Badge animation
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      );

      // Heading split text animation
      if (headingRef.current) {
        const lines = headingRef.current.querySelectorAll(".hero-line");
        tl.fromTo(
          lines,
          {
            opacity: 0,
            y: 100,
            rotateX: -40,
            transformOrigin: "center bottom",
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power4.out",
          },
          "-=0.4",
        );
      }

      // Subheading
      tl.fromTo(
        subheadingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6",
      );

      // CTAs with magnetic effect setup
      tl.fromTo(
        ctaRef.current?.children || [],
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 },
        "-=0.4",
      );

      // Stats counter animation
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll(".stat-item");
        tl.fromTo(
          statItems,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
          },
          "-=0.3",
        );

        // Animate the number counters
        statsRef.current.querySelectorAll(".stat-value").forEach((el) => {
          const target = el.getAttribute("data-value");
          if (target && !isNaN(Number(target))) {
            gsap.fromTo(
              { val: 0 },
              { val: Number(target) },
              {
                val: Number(target),
                duration: 2,
                delay: 1,
                ease: "power2.out",
                onUpdate: function () {
                  el.textContent = Math.round(this.targets()[0].val) + "%";
                },
              },
            );
          }
        });
      }

      // Floating glow animation
      gsap.to(glowRef.current, {
        x: 50,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(glow2Ref.current, {
        x: -40,
        y: 40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Parallax effect on scroll
      gsap.to(glowRef.current, {
        y: -200,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pt-16"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Animated Glow Effects */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      </div>
      <div ref={glow2Ref} className="absolute right-1/4 top-1/3">
        <div className="h-[300px] w-[300px] rounded-full bg-accent/15 blur-[100px]" />
      </div>

      {/* Mundo de nodos (canvas) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center opacity-[0.5] mix-blend-screen sm:opacity-[0.55]"
        aria-hidden
      >
        <div className="h-[min(92vh,820px)] w-[min(92vw,820px)] max-w-[100vw]">
          <HeroNodeGlobe className="h-full w-full" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
          {/* Badge */}
          <div ref={badgeRef} className="mb-8 opacity-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              IA empresarial lista para onboarding
            </span>
          </div>

          {/* Main Heading with perspective */}
          <h1
            ref={headingRef}
            className="max-w-5xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ perspective: "1000px" }}
          >
            <span className="hero-line block text-balance opacity-0">
              COGNITFY <hr /> Operaciones Inteligentes
            </span>
            <span className="hero-line block text-gradient text-balance opacity-0">
              a Escala Empresarial
            </span>
          </h1>

          {/* Subheading */}
          <p
            ref={subheadingRef}
            className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground opacity-0 sm:text-xl"
          >
            Cognitfy asume procesos completos —llamadas,
            incidencias, facturación, pedidos, correos, informes— y los ejecuta
            24/7 conectado a lo que la empresa ya usa. Menos coste operativo, más capacidad comercial y de
            servicio.
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden bg-foreground text-background transition-all hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(0,245,255,0.3)]"
            >
              <Link href="#descubrimiento">
                <span className="relative z-10 flex items-center">
                  Agendar sesión de descubrimiento
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border bg-transparent transition-all hover:border-primary/50 hover:bg-secondary hover:!text-white hover:shadow-[0_0_20px_rgba(0,245,255,0.1)]"
            >
              <Link href="/flujo">Ver qué puede hacer</Link>
            </Button>
          </div>

          {/* Stats with counter animation */}
          <div
            ref={statsRef}
            className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {[
              { value: "24/7", label: "Disponibilidad real", isText: true },
              {
                value: "90 min",
                label: "Para mapear oportunidad",
                isText: true,
              },
              { value: "Días", label: "Arranque guiado", isText: true },
              {
                value: "1.400+",
                label: "Conexiones con herramientas",
                isText: true,
              },
            ].map((stat, index) => (
              <div key={index} className="stat-item text-center opacity-0">
                <div
                  className="stat-value text-3xl font-bold text-primary sm:text-4xl"
                  data-value={stat.isText ? undefined : stat.value}
                >
                  {stat.isText ? stat.value : "0%"}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
