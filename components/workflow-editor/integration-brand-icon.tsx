"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getIntegrationSimpleIcon } from "@/lib/integration-brand-icons";

export function IntegrationBrandIcon({
  integrationKey,
  Fallback,
  className,
  size = 16,
}: {
  integrationKey: string | undefined | null;
  Fallback: LucideIcon;
  className?: string;
  size?: number;
}) {
  const si = integrationKey ? getIntegrationSimpleIcon(integrationKey) : null;

  if (si) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={cn("block shrink-0 overflow-visible", className)}
        aria-hidden
      >
        <path fill={`#${si.hex}`} d={si.path} />
      </svg>
    );
  }

  return <Fallback className={cn("shrink-0", className)} />;
}
