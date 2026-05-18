"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const navLinks = [
  { href: "#reto", label: "El Reto" },
  { href: "#capacidades", label: "Capacidades" },
  { href: "#integraciones", label: "Integraciones" },
  { href: "/flujo", label: "Pizarra" },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#descubrimiento", label: "Sesión Estratégica" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        logoRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6 },
      );

      if (linksRef.current) {
        const links = linksRef.current.querySelectorAll("a");
        tl.fromTo(
          links,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 },
          "-=0.3",
        );
      }
    }, navRef);

    // Scroll handler
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Link hover animation
  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const link = e.currentTarget;
    gsap.to(link, {
      y: -2,
      color: "var(--foreground)",
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleLinkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const link = e.currentTarget;
    gsap.to(link, {
      y: 0,
      color: "var(--muted-foreground)",
      duration: 0.2,
      ease: "power2.out",
    });
  };

  // Mobile menu animation
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        ".mobile-link",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" },
      );
    }
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-lg shadow-black/10"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            ref={logoRef}
            href="/"
            className="group flex items-center gap-2.5 opacity-0"
          >
            <Image
              src="/logo_cognitfy.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain transition-opacity group-hover:opacity-90"
              priority
            />
            <span className="text-xl font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary">
              Cognitfy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div
            ref={linksRef}
            className="hidden items-center gap-8 md:ml-auto md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-muted-foreground transition-colors"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}
              >
                {link.label}
                {/* Underline effect */}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="relative z-50 p-2 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative h-6 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-foreground transition-all duration-300 ${
                  isOpen ? "top-3 rotate-45" : "top-1"
                }`}
              />
              <span
                className={`absolute left-0 top-3 block h-0.5 w-6 bg-foreground transition-all duration-300 ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-foreground transition-all duration-300 ${
                  isOpen ? "top-3 -rotate-45" : "top-5"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-background/98 backdrop-blur-xl transition-all duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div className="space-y-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-link block rounded-xl px-4 py-4 text-xl font-medium text-foreground transition-all hover:bg-primary/10 hover:text-primary"
                onClick={() => setIsOpen(false)}
                style={{ opacity: 0 }}
              >
                <span className="flex items-center justify-between">
                  {link.label}
                  <span className="text-sm text-muted-foreground">
                    0{index + 1}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-border pt-6">
            <p className="text-center text-sm text-muted-foreground">
              Menos tareas repetitivas, más margen operativo
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
