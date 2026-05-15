"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { LANDING_INTEGRATIONS } from "@/lib/landing-integrations";
import { IntegrationBrandIcon } from "@/components/workflow-editor/integration-brand-icon";
import {
  animateSectionHeader,
  registerGsapScroll,
} from "@/lib/gsap-section";

/** Pool de logos reutilizables (patrón [CodePen WbbEGmp](https://codepen.io/GreenSock/pen/WbbEGmp)). */
const TRAIL_POOL_SIZE = 28;
/** Distancia mínima del cursor (px) antes de soltar otro logo. */
const TRAIL_GAP = 72;

export function IntegrationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trailAreaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapScroll();
    const ctx = gsap.context(() => {
      animateSectionHeader(headerRef.current);

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(
          "[data-integration-card]",
        );
        gsap.fromTo(
          cards,
          { opacity: 0, y: 16, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.018,
            ease: "power3.out",
            scrollTrigger: {
              trigger: trailAreaRef.current ?? gridRef.current,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    }, sectionRef);

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cleanupTrail: (() => void) | undefined;

    if (!reduced) {
      const area = trailAreaRef.current;
      if (!area) return () => ctx.revert();

      const flair = gsap.utils.toArray<HTMLElement>(
        area.querySelectorAll("[data-trail-logo]"),
      );
      if (flair.length === 0) return () => ctx.revert();

      let index = 0;
      const wrapIndex = gsap.utils.wrap(0, flair.length);
      let mousePos = { x: 0, y: 0 };
      let lastMousePos = { x: 0, y: 0 };

      const playAnimation = (shape: HTMLElement) => {
        const areaH = area.offsetHeight;
        const fall = Math.min(areaH * 0.55, 220);
        const tl = gsap.timeline();
        tl.from(shape, {
          opacity: 0,
          scale: 0,
          ease: "elastic.out(1, 0.3)",
          duration: 0.55,
        })
          .to(
            shape,
            {
              rotation: gsap.utils.random(-180, 180),
              duration: 0.35,
            },
            "<",
          )
          .to(
            shape,
            {
              y: fall,
              opacity: 0,
              ease: "power2.in",
              duration: 0.85,
            },
            0.08,
          );
      };

      const spawnLogo = () => {
        const rect = area.getBoundingClientRect();
        const el = flair[wrapIndex(index)]!;
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "all" });
        gsap.set(el, {
          opacity: 1,
          left: mousePos.x - rect.left,
          top: mousePos.y - rect.top,
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          rotation: 0,
        });
        playAnimation(el);
        index++;
      };

      const imageTrail = () => {
        const travelDistance = Math.hypot(
          lastMousePos.x - mousePos.x,
          lastMousePos.y - mousePos.y,
        );
        if (travelDistance > TRAIL_GAP) {
          spawnLogo();
          lastMousePos = { x: mousePos.x, y: mousePos.y };
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        mousePos = { x: e.clientX, y: e.clientY };
      };

      const onPointerEnter = (e: PointerEvent) => {
        mousePos = { x: e.clientX, y: e.clientY };
        lastMousePos = { x: mousePos.x, y: mousePos.y };
      };

      area.addEventListener("pointermove", onPointerMove);
      area.addEventListener("pointerenter", onPointerEnter);
      gsap.ticker.add(imageTrail);

      cleanupTrail = () => {
        area.removeEventListener("pointermove", onPointerMove);
        area.removeEventListener("pointerenter", onPointerEnter);
        gsap.ticker.remove(imageTrail);
        gsap.killTweensOf(flair);
      };
    }

    return () => {
      cleanupTrail?.();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="integraciones" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute left-0 top-1/3">
        <div className="h-[280px] w-[280px] rounded-full bg-accent/15 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center">
          <span className="section-label text-sm font-medium uppercase tracking-wider text-primary">
            Ecosistema
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-balance">Integraciones nativas</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-balance text-lg text-muted-foreground">
            Correo, chat, CRM, cobros, datos y más. Mové el cursor por el panel:
            cada tramo deja caer logos de herramientas (como en el{" "}
            <a
              href="https://codepen.io/GreenSock/pen/WbbEGmp"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              demo de GSAP
            </a>
            ).
          </p>
        </div>

        <div
          ref={trailAreaRef}
          className="relative mt-12 min-h-[min(84vh,860px)] overflow-hidden rounded-3xl border border-border/80 bg-card/35 shadow-inner backdrop-blur-sm [@media(prefers-reduced-motion:reduce)]:min-h-[520px]"
        >
          <div className="relative z-10 flex min-h-[min(84vh,860px)] flex-col [@media(prefers-reduced-motion:reduce)]:min-h-[520px]">
            <p className="pointer-events-none shrink-0 px-5 pt-5 text-center text-sm text-muted-foreground sm:text-base">
              Pasá el cursor: se sueltan logos con rebote y caen suavemente. Todas
              las integraciones están en la caja.
            </p>

            <div
              ref={gridRef}
              className="flex flex-1 flex-wrap content-start justify-center gap-2 px-4 pb-6 pt-6 sm:gap-2.5 sm:px-6 sm:pb-8 sm:pt-8"
            >
              {LANDING_INTEGRATIONS.map(({ key, name, Icon }) => (
                <div
                  key={key}
                  data-integration-card
                  className="flex items-center gap-2 rounded-xl border border-border/90 bg-card/85 px-2.5 py-1.5 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card sm:gap-2.5 sm:rounded-2xl sm:px-3 sm:py-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/55 sm:h-9 sm:w-9 sm:rounded-xl">
                    <IntegrationBrandIcon
                      integrationKey={key}
                      Fallback={Icon}
                      size={19}
                      className="text-foreground"
                    />
                  </div>
                  <span className="max-w-[10.5rem] truncate text-xs font-medium text-foreground sm:max-w-none sm:text-sm">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Capa de lluvia de logos (encima de las tags, z-30) */}
          <div
            className="pointer-events-none absolute inset-0 z-30 [@media(prefers-reduced-motion:reduce)]:hidden"
            aria-hidden
          >
            {Array.from({ length: TRAIL_POOL_SIZE }).map((_, i) => {
              const { key, name, Icon } =
                LANDING_INTEGRATIONS[i % LANDING_INTEGRATIONS.length];
              return (
                <div
                  key={`trail-${i}`}
                  data-trail-logo
                  className="absolute flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-background opacity-0 shadow-lg ring-1 ring-primary/15 sm:h-16 sm:w-16"
                  title={name}
                >
                  <IntegrationBrandIcon
                    integrationKey={key}
                    Fallback={Icon}
                    size={30}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-8 hidden text-center text-sm text-muted-foreground [@media(prefers-reduced-motion:reduce)]:block">
          Preferís menos movimiento: la lluvia de logos está desactivada; el
          listado sigue visible arriba.
        </p>
      </div>
    </section>
  );
}
