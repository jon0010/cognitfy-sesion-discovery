"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { registerGsapScroll } from "@/lib/gsap-section";

const footerLinks = {
  producto: [
    { label: "Capacidades", href: "#capacidades" },
    { label: "Paquetes", href: "#paquetes" },
    { label: "Integraciones", href: "#" },
    { label: "Seguridad", href: "#" },
  ],
  empresa: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Casos de éxito", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contacto", href: "#" },
  ],
  legal: [
    { label: "Privacidad", href: "#" },
    { label: "Términos", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapScroll();
    const ctx = gsap.context(() => {
      if (brandRef.current) {
        gsap.fromTo(
          brandRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: brandRef.current,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          },
        );

        const socials = brandRef.current.querySelectorAll(".footer-social");
        gsap.fromTo(
          socials,
          { opacity: 0, scale: 0.6 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            stagger: 0.08,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: brandRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
            delay: 0.2,
          },
        );
      }

      if (linksRef.current) {
        const cols = linksRef.current.querySelectorAll(".footer-col");
        gsap.fromTo(
          cols,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: linksRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      if (bottomRef.current) {
        gsap.fromTo(
          bottomRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bottomRef.current,
              start: "top 95%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative border-t border-border bg-card/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div ref={brandRef} className="lg:col-span-1">
            <Link href="/" className="group flex items-center gap-2.5">
              <Image
                src="/logo_cognitfy.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="text-xl font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary">
                Cognitfy
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Automatización con sentido comercial: menos carga repetitiva, más
              capacidad para vender y servir. Cognitfy ejecuta lo acordado y lo
              deja visible para dirección.
            </p>

            <div className="mt-6 flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="footer-social flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:border-primary/50 hover:bg-primary/10"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          <div
            ref={linksRef}
            className="grid grid-cols-3 gap-8 lg:col-span-3"
          >
            <div className="footer-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Producto
              </h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.producto.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Empresa
              </h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.empresa.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          ref={bottomRef}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row"
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cognitfy. Todos los derechos
            reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Material para partners y equipos comerciales.
          </p>
        </div>
      </div>
    </footer>
  );
}
