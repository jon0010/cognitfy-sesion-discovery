"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import gsap from "gsap";
import {
  AlertOctagon,
  HeartPulse,
  ShieldCheck,
  LineChart,
  Sparkles,
  Layers,
  Brain,
} from "lucide-react";
import { AndroidScrollSequence } from "@/components/android-scroll-sequence";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animateSectionHeader,
  cardTiltOnMove,
  cardTiltReset,
  registerGsapScroll,
} from "@/lib/gsap-section";

type AgentTone = "warning" | "rose" | "quality" | "strategic";

type CoreAgent = {
  id: string;
  step: string;
  icon: typeof AlertOctagon;
  title: string;
  tagline: string;
  description: string;
  tone: AgentTone;
  featured?: boolean;
};

const toneStyles: Record<
  AgentTone,
  { ring: string; icon: string; glow: string; led: string; border: string }
> = {
  warning: {
    ring: "border-amber-400/50",
    icon: "bg-amber-500/15 text-amber-400",
    glow: "from-amber-500/20",
    led: "bg-amber-400 shadow-[0_0_8px_oklch(0.75_0.15_85)]",
    border: "hover:border-amber-400/40",
  },
  rose: {
    ring: "border-pink-400/50",
    icon: "bg-pink-500/15 text-pink-400",
    glow: "from-pink-500/20",
    led: "bg-pink-400 shadow-[0_0_8px_oklch(0.72_0.18_350)]",
    border: "hover:border-pink-400/40",
  },
  quality: {
    ring: "border-primary/50",
    icon: "bg-primary/15 text-primary",
    glow: "from-primary/20",
    led: "bg-primary shadow-[0_0_8px_oklch(0.70_0.18_250)]",
    border: "hover:border-primary/40",
  },
  strategic: {
    ring: "border-accent/60",
    icon: "bg-accent/15 text-accent",
    glow: "from-accent/25",
    led: "bg-accent shadow-[0_0_10px_oklch(0.75_0.20_195)]",
    border: "hover:border-accent/50",
  },
};

const coreAgents: CoreAgent[] = [
  {
    id: "ops",
    step: "01",
    icon: AlertOctagon,
    title: "Operación en tiempo real",
    tagline: "Errores y continuidad",
    description:
      "Detecta errores e incidencias mientras ocurre la interacción y dispara avisos al equipo operativo. Con esas notificaciones, el equipo aplica soluciones de inmediato para mantener la operatividad, sin esperar al cierre del día ni a un informe manual.",
    tone: "warning",
  },
  {
    id: "sentiment",
    step: "02",
    icon: HeartPulse,
    title: "Experiencia y sentimiento",
    tagline: "Scoring emocional",
    description:
      "Analiza el sentimiento del usuario en cada conversación: asigna un scoring, resume el tono y señala satisfacción, tensión o riesgo de abandono antes de que el caso escale.",
    tone: "rose",
  },
  {
    id: "quality",
    step: "03",
    icon: ShieldCheck,
    title: "Calidad y coherencia",
    tagline: "Estándar de atención",
    description:
      "Evalúa la coherencia y completitud de las respuestas del super agente, las clasifica y eleva el estándar de atención para que cada interacción cumpla el nivel que la organización exige.",
    tone: "quality",
  },
  {
    id: "strategy",
    step: "04",
    icon: LineChart,
    title: "Inteligencia para dirección",
    tagline: "Prioridad estratégica",
    description:
      "Analiza cada conversación de punta a punta y genera learnings accionables para dirección: retención, expansión, mejora de atención y asignación de recursos. Es el agente que convierte el diálogo en decisiones adelantadas, no solo en tareas resueltas.",
    tone: "strategic",
    featured: true,
  },
];

const implicitInsights = [
  {
    text: "Este cliente es bueno para la organización: compra de forma recurrente, aproximadamente cada quincena.",
    type: "Oportunidad",
  },
  {
    text: "El 15% de las llamadas de la última semana terminó con un agradecimiento explícito del usuario.",
    type: "Satisfacción",
  },
  {
    text: "En comparación con la semana anterior, el 60% de los usuarios cortó la llamada de forma abrupta.",
    type: "Alerta",
  },
  {
    text: "Las consultas sobre ampliación de servicio subieron tras respuestas más detalladas en soporte.",
    type: "Tendencia",
  },
];

function AgentCard({
  agent,
  onHover,
  onLeave,
  children,
}: {
  agent: CoreAgent;
  onHover: (e: MouseEvent<HTMLElement>) => void;
  onLeave: (e: MouseEvent<HTMLElement>) => void;
  children?: ReactNode;
}) {
  const styles = toneStyles[agent.tone];
  const Icon = agent.icon;

  return (
    <article
      data-agent-id={agent.id}
      className={`core-agent-card group relative w-full min-w-0 ${
        agent.featured ? "ring-1 ring-accent/30" : ""
      }`}
      style={{ transformStyle: "preserve-3d" }}
      onMouseMove={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${styles.glow} to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div
        className={`relative h-full overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 backdrop-blur-sm transition-colors sm:p-6 ${styles.border} ${
          agent.featured
            ? "bg-gradient-to-br from-accent/5 via-card/95 to-card/90"
            : ""
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex shrink-0 items-start gap-4">
            <div className="relative">
              <div
                className={`agent-avatar-ring absolute -inset-1 rounded-2xl border ${styles.ring} opacity-50`}
              />
              <div
                className={`agent-avatar relative flex h-14 w-14 items-center justify-center rounded-xl ${styles.icon}`}
              >
                <Icon className="h-6 w-6" />
                <span
                  className={`agent-led absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${styles.led}`}
                />
              </div>
            </div>
            <div className="min-w-0 flex-1 sm:hidden">
              <AgentMeta agent={agent} />
              <h3 className="mt-1.5 text-lg font-semibold">{agent.title}</h3>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="hidden sm:block">
              <AgentMeta agent={agent} />
            </div>
            <h3 className="mt-0 hidden text-lg font-semibold sm:mt-1.5 sm:block">
              {agent.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {agent.description}
            </p>
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}

function AgentMeta({ agent }: { agent: CoreAgent }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Agente {agent.step}
      </span>
      <span className="rounded-full border border-border/80 bg-background/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {agent.tagline}
      </span>
      {agent.featured && (
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Más importante
        </span>
      )}
    </div>
  );
}

export function CognitiveCoreSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const coreBodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapScroll();
    const ctx = gsap.context(() => {
      animateSectionHeader(headerRef.current);

      [bridgeRef, layerRef].forEach((ref) => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(".core-agent-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    }, sectionRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  const handleHover = (e: MouseEvent<HTMLElement>) => {
    cardTiltOnMove(e);
    gsap.to(e.currentTarget.querySelector(".agent-avatar"), {
      scale: 1.06,
      duration: 0.25,
    });
  };

  const handleLeave = (e: MouseEvent<HTMLElement>) => {
    cardTiltReset(e.currentTarget);
    gsap.to(e.currentTarget.querySelector(".agent-avatar"), {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const tacticalAgents = coreAgents.filter((a) => !a.featured);
  const strategicAgent = coreAgents.find((a) => a.featured)!;

  return (
    <section
      ref={sectionRef}
      id="nucleo-cognitivo"
      className="relative overflow-x-clip py-24 sm:py-32 lg:overflow-visible"
    >
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center">
          <span className="section-label text-sm font-medium uppercase tracking-wider text-accent">
            El núcleo
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-balance">
              Potencia cognitiva: <span className="text-gradient">agentes</span>{" "}
              que analizan y aprovechan el dato de cada conversación
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-balance text-lg text-muted-foreground">
            La propuesta de valor de COGNITFY se basa en la combinación entre la
            reducción de costos, tiempos y esfuerzo operativo para directivos y
            equipos de trabajo, junto con una capa diferencial de inteligencia
            estratégica que potencia la toma de decisiones y la escalabilidad
            del negocio.
          </p>
        </div>
      </div>

      <div
        ref={coreBodyRef}
        className="core-nucleo-layout relative mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:mt-16 lg:px-8"
      >
        <div className="core-nucleo-grid lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,44%)] lg:items-stretch lg:gap-4">
          <div className="core-nucleo-content relative z-10 flex min-w-0 flex-col gap-10 lg:gap-12">
            {/* Confort vs core */}
            <div
              ref={bridgeRef}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch md:gap-5"
            >
              <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border/80 bg-card/90 p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lo que ya ves
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  Confort operativo
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Menos carga manual, procesos que avanzan solos, tiempo
                  comprado para vender, decidir y liderar. Modernidad y
                  eficiencia en el día a día.
                </p>
              </div>
              <div className="flex h-full min-w-0 flex-col rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-card/90 p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  El diferencial
                </p>
                <h3 className="mt-2 text-lg font-semibold">Core analítico</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  En cada interacción entre super agentes y usuarios, una capa
                  desmenuza el diálogo, extrae señales y activa cuatro agentes
                  especializados de análisis.
                </p>
              </div>
            </div>

            {/* Capa de análisis */}
            <div
              ref={layerRef}
              className="w-full rounded-2xl border border-primary/20 bg-card/90 bg-gradient-to-r from-primary/10 via-card/90 to-accent/10 p-6 backdrop-blur-sm sm:p-8"
            >
              <div className="flex items-start gap-4 text-left">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                  <Layers className="h-7 w-7 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold sm:text-2xl">
                    Una capa de análisis en cada conversación
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    No se trata solo de ejecutar tareas: es{" "}
                    <strong className="font-medium text-foreground">
                      orquestación cognitiva
                    </strong>{" "}
                    con entrenamiento propio. Los super agentes operan; el core
                    interpreta. El resultado son tendencias y learnings que no
                    aparecen en un CRM como nombre o email, sino como{" "}
                    <strong className="font-medium text-foreground">
                      dato implícito
                    </strong>{" "}
                    — la materia prima para retener clientes, expandir, mejorar
                    la atención y decidir con ventaja.
                  </p>
                </div>
              </div>
            </div>

            {/* Cuatro agentes */}
            <div className="text-left">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Cuatro agentes, una sola capa
              </p>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Cada especialista cubre un frente distinto; juntos convierten lo
                que se dice en la conversación en operación protegida,
                experiencia medida, calidad asegurada e inteligencia para quien
                decide.
              </p>
            </div>

            <div
              ref={gridRef}
              className="grid w-full grid-cols-1 gap-4 sm:gap-5"
            >
              {tacticalAgents.map((agent) => (
                <div key={agent.id} className="contents">
                  <AgentCard
                    agent={agent}
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                </div>
              ))}

              <AgentCard
                agent={strategicAgent}
                onHover={handleHover}
                onLeave={handleLeave}
              >
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                      <Sparkles className="h-3.5 w-3.5" />
                      Dato implícito explotado → informes para dirección
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      El agente estratégico recorre la conversación completa y
                      sintetiza patrones que ningún formulario recoge. Ejemplos
                      del tipo de insight que alimenta la toma de decisiones:
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                    {implicitInsights.map((item, index) => (
                      <li
                        key={index}
                        className="insight-chip rounded-lg border border-border/60 bg-card/70 px-3 py-2.5"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                          {item.type}
                        </span>
                        <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                          {item.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
                    <Brain className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Informes periódicos, alertas de tendencia y
                      recomendaciones para adelantarse: expansión, retención,
                      calidad de atención y asignación de recursos con
                      información que antes no existía como métrica formal.
                    </p>
                  </div>
                </div>
              </AgentCard>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Cognitfy combina la{" "}
              <span className="text-foreground/90">ejecución cómoda</span> que
              libera a dirección con un{" "}
              <span className="text-foreground/90">motor de análisis</span> que
              solo la orquestación cognitiva de super agentes entrenados para la
              organización puede ofrecer. Ese es el core: operar bien y entender
              mejor, en cada interacción.
            </p>
          </div>

          <aside className="core-android-aside pointer-events-none hidden lg:block">
            <div className="core-android-sticky">
              <AndroidScrollSequence />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
