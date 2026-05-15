import { cn } from "@/lib/utils";

type Theme = {
  border: string;
  gradient: string;
  shadow: string;
  logoWrap: string;
};

const THEMES: Record<string, Theme> = {
  slack: {
    border: "border-[#4A154B]/55",
    gradient: "from-[#4A154B]/28 via-card/95 to-card",
    shadow: "shadow-[0_10px_36px_rgba(74,21,75,0.28)]",
    logoWrap: "ring-[#4A154B]/25 bg-[#4A154B]/10",
  },
  teams: {
    border: "border-[#6264A7]/60",
    gradient: "from-[#6264A7]/28 via-card/95 to-card",
    shadow: "shadow-[0_10px_36px_rgba(98,100,167,0.3)]",
    logoWrap: "ring-[#6264A7]/30 bg-[#6264A7]/12",
  },
  salesforce: {
    border: "border-[#00A1E0]/55",
    gradient: "from-[#00A1E0]/26 via-card/95 to-card",
    shadow: "shadow-[0_10px_36px_rgba(0,161,224,0.28)]",
    logoWrap: "ring-[#00A1E0]/30 bg-[#00A1E0]/12",
  },
  twilio: {
    border: "border-[#F22F46]/55",
    gradient: "from-[#F22F46]/24 via-card/95 to-card",
    shadow: "shadow-[0_10px_36px_rgba(242,47,70,0.26)]",
    logoWrap: "ring-[#F22F46]/30 bg-[#F22F46]/10",
  },
  hubspot: {
    border: "border-[#FF7A59]/50",
    gradient: "from-[#FF7A59]/22 via-card/95 to-card",
    shadow: "shadow-[0_10px_32px_rgba(255,122,89,0.22)]",
    logoWrap: "ring-[#FF7A59]/25 bg-[#FF7A59]/10",
  },
  gmail: {
    border: "border-[#EA4335]/45",
    gradient: "from-[#EA4335]/18 via-card/95 to-card",
    shadow: "shadow-[0_8px_28px_rgba(234,67,53,0.18)]",
    logoWrap: "ring-[#EA4335]/20 bg-[#EA4335]/8",
  },
  sheets: {
    border: "border-[#34A853]/50",
    gradient: "from-[#34A853]/20 via-card/95 to-card",
    shadow: "shadow-[0_8px_28px_rgba(52,168,83,0.2)]",
    logoWrap: "ring-[#34A853]/25 bg-[#34A853]/10",
  },
  stripe: {
    border: "border-[#635BFF]/50",
    gradient: "from-[#635BFF]/22 via-card/95 to-card",
    shadow: "shadow-[0_10px_32px_rgba(99,91,255,0.25)]",
    logoWrap: "ring-[#635BFF]/28 bg-[#635BFF]/10",
  },
  zendesk: {
    border: "border-[#03363D]/45",
    gradient: "from-[#03363D]/18 via-card/95 to-card",
    shadow: "shadow-[0_8px_28px_rgba(3,54,61,0.2)]",
    logoWrap: "ring-[#03363D]/25 bg-[#03363D]/8",
  },
  mercadopago: {
    border: "border-[#009EE3]/50",
    gradient: "from-[#009EE3]/20 via-card/95 to-card",
    shadow: "shadow-[0_8px_28px_rgba(0,158,227,0.22)]",
    logoWrap: "ring-[#009EE3]/25 bg-[#009EE3]/10",
  },
  facturae: {
    border: "border-[#0FAAFF]/45",
    gradient: "from-[#0FAAFF]/16 via-card/95 to-card",
    shadow: "shadow-[0_8px_26px_rgba(15,170,255,0.18)]",
    logoWrap: "ring-[#0FAAFF]/22 bg-[#0FAAFF]/8",
  },
  webhook: {
    border: "border-orange-500/45",
    gradient: "from-orange-500/18 via-card/95 to-card",
    shadow: "shadow-[0_8px_26px_rgba(249,115,22,0.18)]",
    logoWrap: "ring-orange-500/25 bg-orange-500/10",
  },
  inbox: {
    border: "border-sky-500/45",
    gradient: "from-sky-500/16 via-card/95 to-card",
    shadow: "shadow-[0_8px_26px_rgba(14,165,233,0.16)]",
    logoWrap: "ring-sky-500/25 bg-sky-500/8",
  },
};

const DEFAULT_INTEGRATION: Theme = {
  border: "border-border/80",
  gradient: "from-muted/35 via-card/95 to-card",
  shadow: "shadow-lg shadow-black/10",
  logoWrap: "ring-border/50 bg-muted/30",
};

export function getIntegrationNodeTheme(
  integrationKey: string | undefined,
): Theme {
  if (!integrationKey) return DEFAULT_INTEGRATION;
  return THEMES[integrationKey] ?? DEFAULT_INTEGRATION;
}

export function integrationNodeShellClass(integrationKey: string | undefined) {
  const t = getIntegrationNodeTheme(integrationKey);
  return cn(
    "rounded-xl border-2 bg-gradient-to-br backdrop-blur-md",
    t.border,
    t.gradient,
    t.shadow,
  );
}

export function integrationLogoWrapClass(integrationKey: string | undefined) {
  const t = getIntegrationNodeTheme(integrationKey);
  return cn(
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/90 p-1 shadow-inner ring-1 dark:border-white/10 dark:bg-white/10",
    t.logoWrap,
  );
}

export function kindNodeShellClass(
  kind: "trigger" | "cognitfy" | "action" | "outcome" | "integration",
) {
  switch (kind) {
    case "cognitfy":
      return cn(
        "rounded-xl border-2 border-primary/70 bg-gradient-to-br from-primary/20 via-card/95 to-card shadow-[0_0_32px_rgba(0,245,255,0.18)] backdrop-blur-md",
      );
    case "trigger":
      return cn(
        "rounded-xl border-2 border-amber-500/45 bg-gradient-to-br from-amber-500/18 via-card/95 to-card shadow-[0_8px_28px_rgba(245,158,11,0.15)] backdrop-blur-md",
      );
    case "outcome":
      return cn(
        "rounded-xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/16 via-card/95 to-card shadow-[0_8px_28px_rgba(16,185,129,0.2)] backdrop-blur-md",
      );
    case "action":
      return cn(
        "rounded-xl border-2 border-violet-500/45 bg-gradient-to-br from-violet-500/14 via-card/95 to-card shadow-[0_8px_26px_rgba(139,92,246,0.14)] backdrop-blur-md",
      );
    default:
      return cn(
        "rounded-xl border-2 border-border/80 bg-gradient-to-br from-muted/25 to-card shadow-md backdrop-blur-md",
      );
  }
}

export function kindLogoWrapClass(
  kind: "trigger" | "cognitfy" | "action" | "outcome" | "integration",
) {
  switch (kind) {
    case "cognitfy":
      return "ring-primary/35 bg-primary/12";
    case "trigger":
      return "ring-amber-500/30 bg-amber-500/10";
    case "outcome":
      return "ring-emerald-500/30 bg-emerald-500/10";
    case "action":
      return "ring-violet-500/30 bg-violet-500/10";
    default:
      return "ring-border/40 bg-muted/25";
  }
}
