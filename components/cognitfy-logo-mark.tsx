"use client";

import { useState } from "react";
import { COGNITFY_LOGO_PATH } from "@/lib/site-branding";

const FALLBACK_LOGO = "/icon.svg";

export function CognitfyLogoMark({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  const [src, setSrc] = useState(COGNITFY_LOGO_PATH);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Cognitfy"
      width={200}
      height={48}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setSrc((s) => (s === FALLBACK_LOGO ? s : FALLBACK_LOGO))}
    />
  );
}
