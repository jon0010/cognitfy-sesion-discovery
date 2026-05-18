"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Mail,
  Database,
  Search,
  LayoutDashboard,
  Bot,
  FileText,
  Globe,
  Network,
  Shield,
  Zap,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: Mail,
    title: "Lee el correo y mueve el proceso",
    description:
      "Prioriza, responde o deriva según reglas de negocio. Menos bandeja saturada y más seguimiento comercial o de servicio sin fricción.",
  },
  {
    icon: Database,
    title: "Habla con lo que el cliente ya usa",
    description:
      "ERP, CRM, contabilidad, tienda online, teléfono… Se conecta a miles de herramientas habituales. No hace falta cambiar de sistema para empezar.",
  },
  {
    icon: Search,
    title: "Información al día, sin pedir informes",
    description:
      "Seguimiento de competencia, datos útiles para ventas o dirección, y lectura clara de lo que está pasando en la operación.",
  },
  {
    icon: LayoutDashboard,
    title: "Todo visible en un panel",
    description:
      "Qué se ejecutó, cuándo y con qué resultado. El responsable ve el impacto sin depender de reuniones eternas para enterarse.",
  },
];

const capabilities = [
  {
    icon: Bot,
    title: "Tareas complejas, flujo simple",
    description:
      "Combinamos automatización clásica con inteligencia artificial donde aporta: velocidad, precio y privacidad según cada caso.",
  },
  {
    icon: FileText,
    title: "Respuestas basadas en “su” documentación",
    description:
      "Políticas, contratos, catálogos y procedimientos internos: el sistema se apoya en lo que la empresa ya tiene por escrito.",
  },
  {
    icon: Globe,
    title: "Datos externos cuando hace falta",
    description:
      "Consultas a la web o fuentes públicas para enriquecer ventas, compras o análisis, siempre dentro de lo que acuerden con el cliente.",
  },
  {
    icon: Network,
    title: "Varios frentes a la vez, coordinados",
    description:
      "No un solo asistente aislado: varios flujos especializados que pueden trabajar en paralelo como un equipo digital.",
  },
  {
    icon: Shield,
    title: "Privacidad y control",
    description:
      "Opciones de despliegue acordes con el nivel de sensibilidad de los datos: desde nube gestionada hasta entornos más cerrados.",
  },
  {
    icon: Zap,
    title: "De la idea a algo tangible en pocos días",
    description:
      "Implementación llave en mano en días o pocas semanas, sin pedir al cliente que aprenda a programar.",
  },
];

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation with text reveal
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      headerTl
        .fromTo(
          headerRef.current?.querySelector(".section-label"),
          { opacity: 0, y: 20, scaleX: 0.5 },
          { opacity: 1, y: 0, scaleX: 1, duration: 0.6, ease: "power3.out" },
        )
        .fromTo(
          headerRef.current?.querySelector("h2"),
          { opacity: 0, y: 40, clipPath: "inset(100% 0% 0% 0%)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.8,
            ease: "power4.out",
          },
          "-=0.3",
        )
        .fromTo(
          headerRef.current?.querySelector("p"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4",
        );

      // Features staggered animation with 3D effect
      if (featuresRef.current) {
        const featureCards =
          featuresRef.current.querySelectorAll(".feature-card");

        gsap.fromTo(
          featureCards,
          {
            opacity: 0,
            y: 80,
            rotateY: -15,
            transformOrigin: "left center",
          },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
            },
          },
        );

        // Icon bounce on scroll
        featureCards.forEach((card) => {
          const icon = card.querySelector(".feature-icon");
          gsap.fromTo(
            icon,
            { scale: 0, rotation: -180 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.6,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
              },
            },
          );
        });
      }

      // Divider animation
      gsap.fromTo(
        dividerRef.current,
        {
          opacity: 0,
          scale: 0.9,
          y: 40,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: dividerRef.current,
            start: "top 85%",
          },
        },
      );

      // Divider inner glow animation
      gsap.to(dividerRef.current?.querySelector(".divider-glow"), {
        opacity: 0.6,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Capabilities grid animation
      if (capabilitiesRef.current) {
        const capCards =
          capabilitiesRef.current.querySelectorAll(".capability-card");

        gsap.fromTo(
          capCards,
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: {
              amount: 0.8,
              grid: [2, 3],
              from: "start",
            },
            ease: "power3.out",
            scrollTrigger: {
              trigger: capabilitiesRef.current,
              start: "top 80%",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Magnetic hover effect for feature cards
  const handleFeatureHover = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    setHoveredFeature(index);
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(card, {
      rotateY: x * 0.02,
      rotateX: -y * 0.02,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleFeatureLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredFeature(null);
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="capacidades"
      className="relative py-24 sm:py-32"
    >
      {/* Background glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <div className="h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center">
          <span className="section-label inline-block text-sm font-medium uppercase tracking-wider text-accent">
            Alcance
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-balance">No es un chatbot: es ejecución</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-balance text-lg text-muted-foreground">
            Cognitfy entiende contexto y hace ejecuta procesos de valor: crea
            tareas, envía comunicaciones y avanza procesos. El cliente recupera
            tiempo para vender, cobrar y decidir; el interlocutor comercial
            tiene un relato claro y verificable.
          </p>
        </div>

        {/* Main Features Grid */}
        <div
          ref={featuresRef}
          className="mt-16 grid gap-6 sm:grid-cols-2"
          style={{ perspective: "1000px" }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-8 transition-all hover:border-primary/50"
              style={{ transformStyle: "preserve-3d" }}
              onMouseMove={(e) => handleFeatureHover(index, e)}
              onMouseLeave={handleFeatureLeave}
            >
              <div className="flex items-start gap-5">
                <div className="feature-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Animated hover gradient */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    hoveredFeature === index
                      ? "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,245,255,0.1), transparent 50%)"
                      : "none",
                }}
              />

              {/* Corner glow */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div ref={dividerRef} className="my-20">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            {/* Animated glow background */}
            <div className="divider-glow absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

            <h3 className="relative z-10 text-2xl font-bold sm:text-3xl">
              Una solución para cada necesidad
            </h3>
            <p className="relative z-10 mt-4 text-muted-foreground">
              El valor no está en una “caja” cerrada: está en cómo se conecta la
              operación real del cliente — administraciones, despachos,
              comercio, servicios, logística… La propuesta comercial es siempre:
              menos carga interna, más continuidad y más margen.
            </p>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div
          ref={capabilitiesRef}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="capability-card group rounded-xl border border-border bg-card/50 p-6 transition-all duration-300 hover:border-accent/50 hover:bg-card hover:shadow-[0_0_30px_rgba(0,200,255,0.1)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
                <capability.icon className="h-5 w-5 text-accent transition-all duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-semibold">{capability.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {capability.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          ¿Cómo se ve un flujo con integraciones reales?{" "}
          <Link
            href="/flujo"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Abrir la pizarra a pantalla completa
          </Link>
        </p>
      </div>
    </section>
  );
}
