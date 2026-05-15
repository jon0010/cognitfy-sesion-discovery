import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerGsapScroll() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

type HeaderOpts = {
  start?: string;
  labelSelector?: string;
};

/** Revelado de cabecera de sección (label → título → párrafo). */
export function animateSectionHeader(
  headerEl: HTMLElement | null,
  opts: HeaderOpts = {},
) {
  if (!headerEl) return;
  const { start = "top 80%", labelSelector = ".section-label, span" } = opts;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: headerEl,
      start,
      toggleActions: "play none none none",
    },
  });

  const label = headerEl.querySelector(labelSelector);
  const title = headerEl.querySelector("h2");
  const desc = headerEl.querySelector("p");

  if (label) {
    tl.fromTo(
      label,
      { opacity: 0, y: 20, letterSpacing: "0.2em" },
      {
        opacity: 1,
        y: 0,
        letterSpacing: "0.05em",
        duration: 0.6,
        ease: "power3.out",
      },
    );
  }

  if (title) {
    tl.fromTo(
      title,
      { opacity: 0, y: 40, clipPath: "inset(100% 0% 0% 0%)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.8,
        ease: "power4.out",
      },
      label ? "-=0.3" : 0,
    );
  }

  if (desc) {
    tl.fromTo(
      desc,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
      "-=0.45",
    );
  }

  return tl;
}

/** Tilt magnético suave en tarjetas (hover). */
export function cardTiltOnMove(e: React.MouseEvent<HTMLElement>) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  gsap.to(card, {
    rotateY: x * 0.018,
    rotateX: -y * 0.018,
    duration: 0.35,
    ease: "power2.out",
  });
}

export function cardTiltReset(el: HTMLElement) {
  gsap.to(el, {
    rotateY: 0,
    rotateX: 0,
    duration: 0.55,
    ease: "elastic.out(1, 0.55)",
  });
}
