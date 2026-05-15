"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { 
  LineChart, 
  Headphones, 
  FileCheck, 
  ChevronRight,
  Brain,
  Users,
  Building2,
  ShoppingCart,
  Truck,
  Landmark,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const packages = [
  {
    id: "intelligence",
    icon: LineChart,
    title: "Ventas y oportunidades",
    description:
      "Seguimiento de leads, recordatorios, propuestas y lectura de señales del mercado. Menos “se me pasó” y más conversaciones comerciales cerradas.",
    features: [
      "Priorización de oportunidades y próximos pasos",
      "Borradores y recordatorios al equipo comercial",
      "Lectura ordenada de datos útiles para decidir",
      "Alertas cuando algo importante cambia",
    ],
    industries: [Building2, Landmark],
  },
  {
    id: "customer",
    icon: Headphones,
    title: "Atención y soporte 24/7",
    description:
      "Responde en varios canales, clasifica urgencias y deja al humano solo donde aporta valor. Mejor experiencia de cliente sin inflar plantilla.",
    features: [
      "Respuesta automática en los canales acordados",
      "Clasificación de consultas y escalado claro",
      "Continuidad fuera de horario y en picos de demanda",
      "Métricas simples de volumen y resolución",
    ],
    industries: [ShoppingCart, Users],
  },
  {
    id: "operations",
    icon: FileCheck,
    title: "Operación y back-office",
    description:
      "Pedidos, facturas, incidencias, correos internos, checklist de cumplimiento… Lo repetitivo avanza solo y queda trazado para auditoría o dirección.",
    features: [
      "Validaciones y pasos repetibles sin olvidos",
      "Menos errores en picos de trabajo",
      "Informes o extractos listos para revisión humana",
      "Avisos cuando algo se sale del guion",
    ],
    industries: [Landmark, Truck],
  },
]

const allIndustries = [
  { icon: Building2, name: "Corporativo" },
  { icon: Landmark, name: "Finanzas" },
  { icon: ShoppingCart, name: "Retail" },
  { icon: Truck, name: "Logística" },
  { icon: Users, name: "Servicios" },
  { icon: Brain, name: "Tech" },
]

export function PackagesSection() {
  const [activePackage, setActivePackage] = useState(packages[0].id)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const industriesRef = useRef<HTMLDivElement>(null)

  const currentPackage = packages.find((p) => p.id === activePackage)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%"
        }
      })

      headerTl
        .fromTo(
          headerRef.current?.querySelector("span"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 }
        )
        .fromTo(
          headerRef.current?.querySelector("h2"),
          { opacity: 0, y: 40, clipPath: "inset(100% 0% 0% 0%)" },
          { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power4.out" },
          "-=0.3"
        )
        .fromTo(
          headerRef.current?.querySelector("p"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )

      // Tabs animation
      if (tabsRef.current) {
        const tabs = tabsRef.current.querySelectorAll(".package-tab")
        gsap.fromTo(
          tabs,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: tabsRef.current,
              start: "top 85%"
            }
          }
        )
      }

      // Details panel animation
      gsap.fromTo(
        detailsRef.current,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: detailsRef.current,
            start: "top 85%"
          }
        }
      )

      // Industries animation
      if (industriesRef.current) {
        const industryTags = industriesRef.current.querySelectorAll(".industry-tag")
        gsap.fromTo(
          industryTags,
          { opacity: 0, y: 20, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: industriesRef.current,
              start: "top 90%"
            }
          }
        )
      }

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Animate package change
  const handlePackageChange = (packageId: string) => {
    if (packageId === activePackage) return

    const detailContent = detailsRef.current?.querySelector(".detail-content")
    if (detailContent) {
      gsap.to(detailContent, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setActivePackage(packageId)
          gsap.to(detailContent, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power3.out"
          })
        }
      })
    } else {
      setActivePackage(packageId)
    }
  }

  // Tab hover effect
  const handleTabHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const tab = e.currentTarget
    gsap.to(tab, {
      x: 8,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handleTabLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const tab = e.currentTarget
    gsap.to(tab, {
      x: 0,
      duration: 0.3,
      ease: "power2.out"
    })
  }

  return (
    <section ref={sectionRef} id="paquetes" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2">
        <div className="h-[500px] w-[500px] rounded-full bg-accent/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center">
          <span className="inline-block text-sm font-medium uppercase tracking-wider text-accent">
            Ejemplos de uso
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-balance">Casos de uso que el cliente entiende al primer minuto</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-balance text-lg text-muted-foreground">
            Múltiples líneas de conversación típicas. Cada una se traduce en menos
            coste fijo, más capacidad de respuesta y más tranquilidad para quien
            dirige el negocio.
          </p>
        </div>

        {/* Package Selector */}
        <div className="mt-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Package Tabs */}
            <div ref={tabsRef} className="space-y-3 lg:col-span-1">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handlePackageChange(pkg.id)}
                  onMouseEnter={handleTabHover}
                  onMouseLeave={handleTabLeave}
                  className={cn(
                    "package-tab flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-300",
                    activePackage === pkg.id
                      ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(0,245,255,0.15)]"
                      : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                      activePackage === pkg.id ? "bg-primary/20 scale-110" : "bg-secondary"
                    )}
                  >
                    <pkg.icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300",
                        activePackage === pkg.id ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "font-semibold truncate transition-colors duration-300",
                        activePackage === pkg.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {pkg.title}
                    </h3>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 shrink-0 transition-all duration-300",
                      activePackage === pkg.id ? "text-primary rotate-90" : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Package Details */}
            <div
              ref={detailsRef}
              className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-8 lg:col-span-2"
            >
              {currentPackage && (
                <div className="detail-content">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <currentPackage.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{currentPackage.title}</h3>
                      <p className="mt-2 text-muted-foreground">
                        {currentPackage.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Qué incluye este enfoque
                    </h4>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {currentPackage.features.map((feature, index) => (
                        <li 
                          key={index} 
                          className="flex items-center gap-3 group"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 transition-all duration-300 group-hover:bg-accent/40 group-hover:scale-110">
                            <Check className="h-3 w-3 text-accent" />
                          </div>
                          <span className="text-sm transition-colors duration-300 group-hover:text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual indicator */}
                  <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                    <span>Listo para valorar con el cliente</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Industries */}
        <div ref={industriesRef} className="mt-16 text-center">
          <p className="mb-6 text-sm text-muted-foreground">
            Misma lógica en distintos sectores
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {allIndustries.map((industry, index) => (
              <div
                key={index}
                className="industry-tag flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-[0_0_20px_rgba(0,245,255,0.1)]"
              >
                <industry.icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                <span className="text-sm text-muted-foreground">{industry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
