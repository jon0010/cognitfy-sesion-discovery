import gsap from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

export type ImageSequenceConfig = {
  urls: string[];
  canvas: HTMLCanvasElement | string;
  scrollTrigger?: ScrollTrigger.Vars;
  clear?: boolean;
  paused?: boolean;
  fps?: number;
  onUpdate?: (frame: number, image: HTMLImageElement) => void;
};

/** Secuencia en canvas sincronizada al scroll (helper oficial GSAP / CodePen VwgevYW). */
export function imageSequence(config: ImageSequenceConfig) {
  const playhead = { frame: 0 };
  const canvas =
    gsap.utils.toArray(config.canvas)[0] as HTMLCanvasElement | undefined;
  if (!canvas) {
    console.warn("imageSequence: canvas not defined");
    return gsap.timeline();
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return gsap.timeline();

  let curFrame = -1;
  const { onUpdate } = config;

  const updateImage = function (this: gsap.core.Tween) {
    const frame = Math.round(playhead.frame);
    if (frame === curFrame) return;
    if (config.clear) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    const img = images[frame];
    if (img?.complete) {
      ctx.drawImage(img, 0, 0);
    }
    curFrame = frame;
    onUpdate?.call(this, frame, img);
  };

  const images = config.urls.map((url, i) => {
    const img = new Image();
    img.src = url;
    if (i === 0) {
      img.onload = updateImage;
    }
    return img;
  });

  return gsap.to(playhead, {
    frame: images.length - 1,
    ease: "none",
    onUpdate: updateImage,
    duration: images.length / (config.fps ?? 30),
    paused: !!config.paused,
    scrollTrigger: config.scrollTrigger,
  });
};

type VirtualFrameOpts = {
  frameCount?: number;
  width?: number;
  height?: number;
  /** Color de fondo (tema oscuro del sitio). */
  background?: string;
};

/** Genera URLs de frames a partir de un solo PNG (pan/zoom tipo hero scrub). */
export async function buildVirtualFramesFromImage(
  src: string,
  opts: VirtualFrameOpts = {},
): Promise<{ urls: string[]; width: number; height: number }> {
  const frameCount = opts.frameCount ?? 72;
  const background = opts.background ?? "#0d0e14";

  const img = await loadImage(src);
  const aspect = img.naturalWidth / img.naturalHeight;
  const width = opts.width ?? Math.min(1158, img.naturalWidth);
  const height = opts.height ?? Math.round(width / aspect);

  const urls: string[] = [];
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const ctx = off.getContext("2d");
  if (!ctx) return { urls: [src], width, height };

  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1);
    drawVirtualFrame(ctx, img, width, height, t, background);
    urls.push(off.toDataURL("image/jpeg", 0.92));
  }

  return { urls, width, height };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawVirtualFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  t: number,
  background: string,
) {
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);

  const scale = 0.82 + t * 0.22;
  const offsetX = gsap.utils.interpolate(-72, 48, t);
  const offsetY = gsap.utils.interpolate(56, -36, t);
  const rotate = gsap.utils.interpolate(-0.04, 0.03, t);

  const fit = Math.min(w / img.naturalWidth, h / img.naturalHeight) * scale;
  const dw = img.naturalWidth * fit;
  const dh = img.naturalHeight * fit;

  ctx.save();
  ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
  ctx.rotate(rotate);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}
