"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { CognitfyLogoMark } from "@/components/cognitfy-logo-mark";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  GripVertical,
  Inbox,
  KeyRound,
  Loader2,
  Play,
  RefreshCw,
  ScrollText,
  Send,
  Sparkles,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IntegrationBrandIcon } from "@/components/workflow-editor/integration-brand-icon";
import { cn } from "@/lib/utils";
import {
  getIntegrationIcon,
  INTEGRATION_CATALOG,
  type WfEdge,
  type WfNode,
  WORKFLOW_PRESETS,
} from "@/lib/workflow-data";
import {
  getIntegrationNodeTheme,
  integrationLogoWrapClass,
  integrationNodeShellClass,
  kindLogoWrapClass,
  kindNodeShellClass,
} from "@/lib/integration-node-theme";
import {
  readPresetSnapshot,
  writePresetSnapshot,
} from "@/lib/workflow-persist";
import {
  edgeKey,
  layoutWorkflow,
  type Positions,
  topologicalOrder,
  wouldCreateCycle,
} from "@/lib/workflow-layout";

const NODE_W = 168;
const NODE_H = 90;
/** Lienzo lógico (coordenadas de nodos / SVG) */
const CANVAS_LOGIC_W = 1600;
const CANVAS_LOGIC_H = 1000;
const CANVAS_PAD = 40;
const ZOOM_MIN = 0.45;
const ZOOM_MAX = 1.35;
const ZOOM_STEP = 0.1;
/** Alineado con `-left-1.5` / `-right-1.5` y `w-4` de los puertos */
const PORT_OUTSET = 6;
const PORT_R = 8;
const DND_TYPE = "application/x-cognitfy-integration";

const N8N_DOT_STYLE: React.CSSProperties = {
  backgroundColor: "oklch(0.12 0.012 260)",
  backgroundImage: `radial-gradient(oklch(0.42 0.02 260 / 0.45) 1.1px, transparent 1.1px)`,
  backgroundSize: "18px 18px",
};

function portAnchor(
  pos: Positions,
  nodeId: string,
  side: "in" | "out",
): { x: number; y: number } | null {
  const p = pos[nodeId];
  if (!p) return null;
  const cy = p.y + NODE_H / 2;
  if (side === "out") {
    return { x: p.x + NODE_W + PORT_OUTSET - PORT_R, y: cy };
  }
  return { x: p.x - PORT_OUTSET + PORT_R, y: cy };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function clientToCanvas(
  scrollEl: HTMLDivElement,
  clientX: number,
  clientY: number,
  zoom: number,
) {
  const r = scrollEl.getBoundingClientRect();
  return {
    x: (clientX - r.left + scrollEl.scrollLeft) / zoom,
    y: (clientY - r.top + scrollEl.scrollTop) / zoom,
  };
}

function placeNewNodePosition(
  prev: Positions,
  newId: string,
  anchorId: string,
  allIds: string[],
): { x: number; y: number } {
  const anchor = prev[anchorId];
  const proposed = {
    x: (anchor?.x ?? CANVAS_PAD) + NODE_W + 120,
    y: anchor?.y ?? CANVAS_PAD + 40,
  };
  const step = 44;
  let { x, y } = proposed;
  for (let k = 0; k < 48; k++) {
    let collides = false;
    for (const id of allIds) {
      if (id === newId) continue;
      const o = prev[id];
      if (!o) continue;
      if (
        Math.abs(o.x - x) < NODE_W + 16 &&
        Math.abs(o.y - y) < NODE_H + 16
      ) {
        collides = true;
        break;
      }
    }
    if (!collides) return { x, y };
    y += step;
  }
  return { x: proposed.x, y: proposed.y + step * 12 };
}

export function WorkflowEditor() {
  const uid = useId().replace(/:/g, "");
  const markerId = `wf-arrow-${uid}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [presetId, setPresetId] = useState(WORKFLOW_PRESETS[0].id);
  const [nodes, setNodes] = useState<WfNode[]>([]);
  const [edges, setEdges] = useState<WfEdge[]>([]);
  const [positions, setPositions] = useState<Positions>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const dragRef = useRef<{
    id: string;
    ox: number;
    oy: number;
    px: number;
    py: number;
    moved: boolean;
  } | null>(null);

  const [detailNode, setDetailNode] = useState<WfNode | null>(null);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const linkingFromRef = useRef<string | null>(null);
  const [linkLine, setLinkLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  const [execActiveId, setExecActiveId] = useState<string | null>(null);
  const [execDoneIds, setExecDoneIds] = useState<Set<string>>(() => new Set());
  const [execEdges, setExecEdges] = useState<Set<string>>(() => new Set());
  const [executing, setExecuting] = useState(false);
  const execAbortRef = useRef(0);

  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;

  const wfPersistRef = useRef({
    presetId: WORKFLOW_PRESETS[0].id,
    nodes: [] as WfNode[],
    edges: [] as WfEdge[],
    positions: {} as Positions,
    zoom: 1,
  });
  wfPersistRef.current = { presetId, nodes, edges, positions, zoom };

  const loadPreset = useCallback((id: string, opts?: { skipPersist?: boolean }) => {
    if (!opts?.skipPersist) {
      const cur = wfPersistRef.current;
      if (cur.nodes.length > 0) {
        writePresetSnapshot(cur.presetId, {
          nodes: cur.nodes,
          edges: cur.edges,
          positions: cur.positions,
          zoom: cur.zoom,
        });
      }
    }

    const p = WORKFLOW_PRESETS.find((x) => x.id === id);
    if (!p) return;

    const stored = readPresetSnapshot(id);
    if (stored) {
      setPresetId(id);
      setNodes([...stored.nodes]);
      setEdges([...stored.edges]);
      setPositions({ ...stored.positions });
      if (
        typeof stored.zoom === "number" &&
        stored.zoom >= ZOOM_MIN &&
        stored.zoom <= ZOOM_MAX
      ) {
        setZoom(stored.zoom);
      } else {
        setZoom(1);
      }
    } else {
      const n = [...p.nodes];
      const e = [...p.edges];
      setPresetId(id);
      setNodes(n);
      setEdges(e);
      setPositions(layoutWorkflow(n, e));
      setZoom(1);
    }
    setExecActiveId(null);
    setExecDoneIds(new Set());
    setExecEdges(new Set());
    setDetailNode(null);
  }, []);

  const wfInitRef = useRef(false);
  useEffect(() => {
    if (wfInitRef.current) return;
    wfInitRef.current = true;
    loadPreset(WORKFLOW_PRESETS[0].id, { skipPersist: true });
  }, [loadPreset]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const t = window.setTimeout(() => {
      writePresetSnapshot(presetId, {
        nodes,
        edges,
        positions,
        zoom,
      });
    }, 450);
    return () => window.clearTimeout(t);
  }, [nodes, edges, positions, presetId, zoom]);

  useEffect(() => {
    const flush = () => {
      const cur = wfPersistRef.current;
      if (cur.nodes.length > 0) {
        writePresetSnapshot(cur.presetId, {
          nodes: cur.nodes,
          edges: cur.edges,
          positions: cur.positions,
          zoom: cur.zoom,
        });
      }
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (!detailNode) return;
    if (!nodes.some((n) => n.id === detailNode.id)) setDetailNode(null);
  }, [nodes, detailNode]);

  const edgeLines = useMemo(() => {
    return edges
      .map((e) => {
        const a = portAnchor(positions, e.from, "out");
        const b = portAnchor(positions, e.to, "in");
        if (!a || !b) return null;
        return {
          ...e,
          key: edgeKey(e),
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
        };
      })
      .filter(Boolean) as Array<
        WfEdge & {
          key: string;
          x1: number;
          y1: number;
          x2: number;
          y2: number;
        }
      >;
  }, [edges, positions]);

  const relayout = useCallback(() => {
    setPositions(layoutWorkflow(nodes, edges));
  }, [nodes, edges]);

  const removeEdge = useCallback((key: string) => {
    setEdges((prev) => prev.filter((e) => edgeKey(e) !== key));
  }, []);

  const tryAddEdge = useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      const idSet = new Set(nodes.map((n) => n.id));
      if (!idSet.has(from) || !idSet.has(to)) return;
      const dup = edges.some((e) => e.from === from && e.to === to);
      if (dup) return;
      const next: WfEdge = { from, to };
      if (wouldCreateCycle(edges, next, idSet)) return;
      setEdges((prev) => [...prev, next]);
    },
    [nodes, edges],
  );

  const addIntegrationKey = useCallback(
    (key: string) => {
      const def = INTEGRATION_CATALOG.find((i) => i.key === key);
      if (!def) return;
      const cf = nodes.find((n) => n.kind === "cognitfy");
      if (!cf) return;
      const nid = `add-${key}-${Date.now()}`;
      const nn: WfNode = {
        id: nid,
        kind: "integration",
        label: def.name,
        subtitle: "Integración añadida",
        integrationKey: key,
      };
      const nNext = [...nodes, nn];
      const eNext = [...edges, { from: cf.id, to: nid }];
      flushSync(() => {
        setNodes(nNext);
        setEdges(eNext);
      });
      setPositions((prev) => {
        const next = { ...prev };
        next[nid] = placeNewNodePosition(
          prev,
          nid,
          cf.id,
          nNext.map((n) => n.id),
        );
        return next;
      });
    },
    [nodes],
  );

  const portCenter = useCallback(
    (nodeId: string, side: "in" | "out") => {
      return portAnchor(positions, nodeId, side) ?? { x: 0, y: 0 };
    },
    [positions],
  );

  useEffect(() => {
    if (!linkingFrom || !scrollRef.current) return;
    const scrollEl = scrollRef.current;

    const onMove = (ev: PointerEvent) => {
      const from = linkingFromRef.current;
      if (!from || !scrollEl) return;
      const { x, y } = clientToCanvas(scrollEl, ev.clientX, ev.clientY, zoomRef.current);
      const o = portCenter(from, "out");
      setLinkLine({ x1: o.x, y1: o.y, x2: x, y2: y });
    };

    const onUp = (ev: PointerEvent) => {
      const els = document.elementsFromPoint(ev.clientX, ev.clientY);
      const hit = els.find(
        (el) => el instanceof HTMLElement && el.dataset.wfInput === "1",
      ) as HTMLElement | undefined;
      const toId = hit?.dataset.nodeId;
      const fromId = linkingFromRef.current;
      if (toId && fromId && toId !== fromId) {
        tryAddEdge(fromId, toId);
      }
      linkingFromRef.current = null;
      setLinkingFrom(null);
      setLinkLine(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [linkingFrom, portCenter, tryAddEdge]);

  const startLinkFrom = useCallback(
    (fromId: string) => (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!scrollRef.current) return;
      linkingFromRef.current = fromId;
      setLinkingFrom(fromId);
      const o = portCenter(fromId, "out");
      const { x, y } = clientToCanvas(scrollRef.current, e.clientX, e.clientY, zoomRef.current);
      setLinkLine({ x1: o.x, y1: o.y, x2: x, y2: y });
    },
    [portCenter],
  );

  const runWorkflow = useCallback(async () => {
    const token = ++execAbortRef.current;
    setExecuting(true);
    setExecActiveId(null);
    setExecDoneIds(new Set());
    setExecEdges(new Set());
    const order = topologicalOrder(nodes, edges);
    if (order.length === 0) {
      setExecuting(false);
      return;
    }
    const done = new Set<string>();
    for (const stepId of order) {
      if (execAbortRef.current !== token) return;
      const incoming = edges.filter((e) => e.to === stepId && done.has(e.from));
      setExecEdges(new Set(incoming.map((e) => edgeKey(e))));
      setExecActiveId(stepId);
      await sleep(700);
      if (execAbortRef.current !== token) return;
      done.add(stepId);
      setExecDoneIds(new Set(done));
      setExecActiveId(null);
      setExecEdges(new Set());
      await sleep(240);
    }
    if (execAbortRef.current !== token) return;
    await sleep(1000);
    if (execAbortRef.current !== token) return;
    setExecDoneIds(new Set());
    setExecEdges(new Set());
    setExecuting(false);
  }, [nodes, edges]);

  const stopExecution = useCallback(() => {
    execAbortRef.current++;
    setExecActiveId(null);
    setExecDoneIds(new Set());
    setExecEdges(new Set());
    setExecuting(false);
  }, []);

  const onPaletteDragStart = (key: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData(DND_TYPE, key);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const key = e.dataTransfer.getData(DND_TYPE);
    if (!key) return;
    addIntegrationKey(key);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => {
        const nz = Math.min(
          ZOOM_MAX,
          Math.max(ZOOM_MIN, Math.round((z + delta) * 100) / 100),
        );
        return nz;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const setNodePos = useCallback((id: string, x: number, y: number) => {
    const maxX = CANVAS_LOGIC_W - NODE_W - CANVAS_PAD;
    const maxY = CANVAS_LOGIC_H - NODE_H - CANVAS_PAD;
    const nx = Math.min(Math.max(CANVAS_PAD, x), maxX);
    const ny = Math.min(Math.max(CANVAS_PAD, y), maxY);
    setPositions((prev) => ({ ...prev, [id]: { x: nx, y: ny } }));
  }, []);

  const onNodePointerDown =
    (id: string) => (e: React.PointerEvent<HTMLDivElement>) => {
      if (linkingFromRef.current) return;
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("[data-wf-port]")) return;
      e.preventDefault();
      const p = positions[id];
      if (!p) return;
      dragRef.current = {
        id,
        ox: p.x,
        oy: p.y,
        px: e.clientX,
        py: e.clientY,
        moved: false,
      };
      setDraggingId(id);
      e.currentTarget.setPointerCapture(e.pointerId);
    };

  const onNodePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (linkingFromRef.current) return;
    const d = dragRef.current;
    if (!d) return;
    if (
      !d.moved &&
      Math.abs(e.clientX - d.px) + Math.abs(e.clientY - d.py) > 6
    ) {
      d.moved = true;
    }
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    const z = zoomRef.current;
    setNodePos(d.id, d.ox + dx / z, d.oy + dy / z);
  };

  const onNodePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (d && !d.moved && !linkingFromRef.current) {
      const n = nodesRef.current.find((x) => x.id === d.id);
      if (n) setDetailNode(n);
    }
    dragRef.current = null;
    setDraggingId(null);
  };

  const filteredCatalog = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return INTEGRATION_CATALOG;
    return INTEGRATION_CATALOG.filter(
      (i) =>
        i.name.toLowerCase().includes(q) || i.key.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-2 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="shrink-0 rounded-md border border-border bg-card px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-2.5 sm:text-sm"
          >
            ← Inicio
          </Link>
          <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />
          <div className="flex min-w-0 items-center gap-2">
            <CognitfyLogoMark
              priority
              className="h-7 w-auto max-w-[7.5rem] shrink-0 object-contain sm:h-8 sm:max-w-[9rem]"
            />
            <span className="truncate text-sm font-semibold sm:text-base">
              Pizarra de flujos
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            disabled={executing || nodes.length === 0}
            onClick={runWorkflow}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/50 bg-primary/15 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/25 disabled:opacity-40 sm:px-2.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">Ejecutar flujo</span>
          </button>
          {executing ? (
            <button
              type="button"
              onClick={stopExecution}
              className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Detener
            </button>
          ) : null}
          <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
            <button
              type="button"
              title="Alejar"
              disabled={executing}
              onClick={() =>
                setZoom((z) =>
                  Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100),
                )
              }
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Restablecer zoom"
              disabled={executing}
              onClick={() => setZoom(1)}
              className="min-w-[2.75rem] px-1 py-1 text-center text-[11px] font-medium tabular-nums text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              title="Acercar"
              disabled={executing}
              onClick={() =>
                setZoom((z) =>
                  Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100),
                )
              }
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={relayout}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:px-2.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reorganizar</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card/40 lg:w-[min(100%,300px)] lg:border-b-0 lg:border-r xl:w-[min(100%,340px)]">
          <div className="max-h-[32vh] overflow-y-auto border-b border-border p-3 lg:max-h-none lg:flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Casos de uso
            </p>
            <p className="mt-1 text-[10px] leading-snug text-muted-foreground/90">
              Los cambios de cada caso se guardan en este navegador (localStorage).
            </p>
            <div className="mt-2 space-y-2">
              {WORKFLOW_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={executing}
                  onClick={() => loadPreset(p.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-50",
                    presetId === p.id
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-border p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Conexiones
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Arrastra del punto <span className="text-primary">salida</span>{" "}
              (derecha) al <span className="text-accent">entrada</span>{" "}
              (izquierda). Clic en una línea gruesa invisible o aquí para quitar.
            </p>
            <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs">
              {edges.length === 0 ? (
                <li className="text-muted-foreground">Sin aristas.</li>
              ) : (
                edges.map((e) => {
                  const fa = nodes.find((n) => n.id === e.from)?.label ?? e.from;
                  const ta = nodes.find((n) => n.id === e.to)?.label ?? e.to;
                  const k = edgeKey(e);
                  return (
                    <li
                      key={k}
                      className="flex items-center justify-between gap-2 rounded border border-border/60 bg-background/50 px-2 py-1"
                    >
                      <span className="min-w-0 truncate text-muted-foreground">
                        <span className="text-foreground">{fa}</span>
                        <span className="mx-1">→</span>
                        <span className="text-foreground">{ta}</span>
                      </span>
                      <button
                        type="button"
                        title="Quitar conexión"
                        className="shrink-0 rounded p-1 text-destructive hover:bg-destructive/10"
                        onClick={() => removeEdge(k)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-3 lg:max-h-[40vh]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Integraciones
            </p>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar…"
              className="mt-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm outline-none ring-primary/30 focus-visible:ring-2"
            />
            <div className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
              {filteredCatalog.map((row) => {
                const tint = getIntegrationNodeTheme(row.key);
                return (
                <div
                  key={row.key}
                  draggable
                  onDragStart={onPaletteDragStart(row.key)}
                  className="flex cursor-grab items-center gap-2 rounded-lg border border-transparent bg-background/60 px-2 py-1.5 text-sm transition-colors hover:border-primary/35 hover:bg-primary/5 active:cursor-grabbing"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/90 p-0.5 shadow-sm ring-1 dark:bg-white/10",
                      tint.logoWrap,
                    )}
                  >
                    <IntegrationBrandIcon
                      integrationKey={row.key}
                      Fallback={row.Icon}
                      className="text-muted-foreground"
                      size={20}
                    />
                  </div>
                  <span className="min-w-0 flex-1 truncate">{row.name}</span>
                  <button
                    type="button"
                    onClick={() => addIntegrationKey(row.key)}
                    className="shrink-0 rounded p-1 text-primary hover:bg-primary/10"
                    title="Añadir al flujo"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              );
              })}
            </div>
          </div>
        </aside>

        <main
          className="relative min-h-0 min-w-0 flex-1"
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
        >
          <div
            ref={scrollRef}
            className="h-full min-h-[280px] w-full overflow-auto"
            style={N8N_DOT_STYLE}
          >
            <div
              className="relative"
              style={{
                width: CANVAS_LOGIC_W * zoom,
                height: CANVAS_LOGIC_H * zoom,
              }}
            >
              <div
                className="relative pt-14 pl-10 pr-8 pb-10 sm:pt-16 sm:pl-12"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "0 0",
                  width: CANVAS_LOGIC_W,
                  height: CANVAS_LOGIC_H,
                }}
              >
              <svg
                className="pointer-events-none absolute inset-0 overflow-visible"
                aria-hidden
              >
                <defs>
                  <marker
                    id={markerId}
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path
                      d="M0,0 L8,4 L0,8 Z"
                      className="fill-primary/55"
                    />
                  </marker>
                </defs>
                {edgeLines.map((edge) => {
                  const hot = execEdges.has(edge.key);
                  return (
                    <g key={edge.key}>
                      <line
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        strokeWidth={16}
                        stroke="transparent"
                        className="pointer-events-auto cursor-pointer hover:stroke-primary/10"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          removeEdge(edge.key);
                        }}
                      />
                      <line
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        strokeWidth={hot ? 3 : 2}
                        strokeDasharray="10 8"
                        strokeLinecap="round"
                        className={cn(
                          "pointer-events-none stroke-primary/40 wf-edge-dash",
                          hot && "stroke-primary wf-edge-dash-fast opacity-100",
                        )}
                        markerEnd={`url(#${markerId})`}
                      />
                    </g>
                  );
                })}
                {linkLine ? (
                  <line
                    x1={linkLine.x1}
                    y1={linkLine.y1}
                    x2={linkLine.x2}
                    y2={linkLine.y2}
                    strokeWidth={2}
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    className="stroke-accent/85 wf-edge-dash-fast"
                  />
                ) : null}
              </svg>

              {nodes.map((node) => {
                const p = positions[node.id];
                if (!p) return null;
                const IntIcon =
                  node.integrationKey != null
                    ? getIntegrationIcon(node.integrationKey)
                    : null;
                const KindIcon =
                  node.kind === "cognitfy"
                    ? Bot
                    : node.kind === "trigger"
                      ? Inbox
                      : node.kind === "outcome"
                        ? CheckCircle2
                        : node.kind === "action"
                          ? Send
                          : null;
                const FallbackIcon = IntIcon ?? KindIcon ?? GripVertical;
                const shellClass =
                  node.kind === "integration"
                    ? node.integrationKey
                      ? integrationNodeShellClass(node.integrationKey)
                      : kindNodeShellClass("integration")
                    : kindNodeShellClass(node.kind);
                const logoWrapClass =
                  node.kind === "integration" && node.integrationKey
                    ? integrationLogoWrapClass(node.integrationKey)
                    : cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/90 p-1 shadow-inner ring-1 dark:bg-white/10",
                        kindLogoWrapClass(node.kind),
                      );
                const glow = execActiveId === node.id;
                const doneStep = execDoneIds.has(node.id);

                return (
                  <div
                    key={node.id}
                    role="group"
                    className={cn(
                      "absolute touch-none select-none bg-card/90",
                      shellClass,
                      draggingId === node.id &&
                        "z-30 opacity-95 ring-2 ring-primary/40",
                      glow &&
                        "z-30 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_48px_rgba(0,245,255,0.42)] motion-safe:animate-pulse",
                      doneStep &&
                        !glow &&
                        "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-background",
                    )}
                    style={{
                      width: NODE_W,
                      height: NODE_H,
                      left: p.x,
                      top: p.y,
                    }}
                    onPointerDown={onNodePointerDown(node.id)}
                    onPointerMove={onNodePointerMove}
                    onPointerUp={onNodePointerUp}
                    onPointerCancel={onNodePointerUp}
                  >
                    <button
                      type="button"
                      data-wf-port="1"
                      data-wf-input="1"
                      data-node-id={node.id}
                      className="absolute -left-1.5 top-1/2 z-40 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-accent bg-background shadow hover:scale-110 hover:bg-accent/20"
                      title="Entrada: suelta aquí el cable"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      data-wf-port="1"
                      data-wf-output="1"
                      data-node-id={node.id}
                      className="absolute -right-1.5 top-1/2 z-40 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow hover:scale-110 hover:bg-primary/20"
                      title="Salida: arrastra hacia otro nodo"
                      onPointerDown={startLinkFrom(node.id)}
                    />
                    <div className="flex h-full w-full cursor-grab items-start gap-2.5 px-3 py-2.5 active:cursor-grabbing">
                      {(glow || doneStep) && (
                        <div
                          className="absolute right-2 top-2 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/95 shadow-md backdrop-blur-sm"
                          aria-hidden
                        >
                          {glow ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                      )}
                      <div className={logoWrapClass}>
                        <IntegrationBrandIcon
                          integrationKey={node.integrationKey}
                          Fallback={FallbackIcon}
                          className="text-muted-foreground"
                          size={node.integrationKey ? 24 : 22}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold leading-tight">
                          {node.label}
                        </p>
                        {node.subtitle ? (
                          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                            {node.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pointer-events-none absolute bottom-6 left-6 max-w-lg rounded-md border border-border/60 bg-background/85 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur-sm">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  Lienzo
                </span>
                : zoom con Ctrl + rueda o los botones. Las posiciones se mantienen
                al añadir integraciones; «Reorganizar» vuelve a colocar todo.
                «Ejecutar» recorre el flujo con carga y check en cada nodo.
              </div>
            </div>
            </div>
          </div>
        </main>
      </div>

      <Sheet
        open={detailNode !== null}
        onOpenChange={(open) => {
          if (!open) setDetailNode(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto border-border p-0 sm:max-w-lg"
        >
          {detailNode ? (
            <NodeDetailBody node={detailNode} nodes={nodes} edges={edges} />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NodeDetailBody({
  node,
  nodes,
  edges,
}: {
  node: WfNode;
  nodes: WfNode[];
  edges: WfEdge[];
}) {
  const incoming = edges.filter((e) => e.to === node.id);
  const outgoing = edges.filter((e) => e.from === node.id);
  const labelOf = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;

  const implByKind =
    node.kind === "cognitfy"
      ? {
          title: "Motor Cognitfy",
          desc: "Orquestación, políticas de negocio y enrutamiento a modelos o acciones.",
          fields: [
            { k: "Modo", v: "Producción (simulado)" },
            { k: "Timeout", v: "120 s" },
            { k: "Reintentos", v: "3" },
            { k: "Versión runtime", v: "2.14.0" },
          ],
        }
      : node.kind === "trigger"
        ? {
            title: "Disparador",
            desc: "Punto de entrada del flujo: canales y validación mínima.",
            fields: [
              { k: "Canal", v: "Webhook + cola interna" },
              { k: "Auth", v: "Bearer · rotación 90 días" },
              { k: "Rate limit", v: "120 req/min" },
            ],
          }
        : node.kind === "outcome"
          ? {
              title: "Cierre del caso",
              desc: "Persistencia y notificación al negocio.",
              fields: [
                { k: "Almacén", v: "Registro auditable 7 años" },
                { k: "Notificación", v: "Email resumen + enlace" },
              ],
            }
          : {
              title: "Integración",
              desc: "Conector hacia sistema externo (credenciales y mapeo).",
              fields: [
                { k: "Conector", v: node.integrationKey ?? "genérico" },
                { k: "Entorno", v: "OAuth2 · scope mínimo" },
                { k: "Mapeo campos", v: "12 campos · 2 transformaciones" },
                { k: "Cuota", v: "2.4k llamadas / día (simulado)" },
              ],
            };

  const logs = [
    `[${new Date().toLocaleTimeString("es")}] INFO  handshake OK`,
    `[${new Date().toLocaleTimeString("es")}] DEBUG payload schema v3`,
    `[${new Date().toLocaleTimeString("es")}] INFO  siguiente paso encolado`,
  ];

  const detailLogoWrap = node.integrationKey
    ? getIntegrationNodeTheme(node.integrationKey).logoWrap
    : "ring-primary/30 bg-primary/12";

  return (
    <>
      <SheetHeader className="border-b border-border bg-card/50 p-5 text-left">
        <SheetTitle className="flex items-start gap-3 pr-8 text-lg leading-tight">
          <span
            className={cn(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/90 p-1 shadow-inner ring-1 dark:bg-white/10",
              detailLogoWrap,
            )}
          >
            {node.integrationKey ? (
              <IntegrationBrandIcon
                integrationKey={node.integrationKey}
                Fallback={getIntegrationIcon(node.integrationKey) ?? Cpu}
                size={22}
                className="text-primary"
              />
            ) : (
              <Cpu className="h-5 w-5 text-primary" />
            )}
          </span>
          <span>
            {implByKind.title}
            <span className="mt-1 block text-sm font-normal text-muted-foreground">
              {node.label}
            </span>
          </span>
        </SheetTitle>
        <SheetDescription className="text-left text-sm leading-relaxed">
          {implByKind.desc}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 p-5">
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" />
            Parámetros (simulado)
          </h4>
          <dl className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
            {implByKind.fields.map((row) => (
              <div
                key={row.k}
                className="flex justify-between gap-3 border-b border-border/50 py-1.5 last:border-0"
              >
                <dt className="text-muted-foreground">{row.k}</dt>
                <dd className="max-w-[55%] text-right font-mono text-xs text-foreground">
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ScrollText className="h-3.5 w-3.5" />
            Log reciente
          </h4>
          <pre className="max-h-32 overflow-auto rounded-lg border border-border bg-background/80 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {logs.join("\n")}
          </pre>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/40 p-3">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              Entradas
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {incoming.length === 0 ? (
                <li className="text-muted-foreground">—</li>
              ) : (
                incoming.map((e) => (
                  <li key={edgeKey(e)} className="text-foreground">
                    ← {labelOf(e.from)}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card/40 p-3">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              Salidas
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {outgoing.length === 0 ? (
                <li className="text-muted-foreground">—</li>
              ) : (
                outgoing.map((e) => (
                  <li key={edgeKey(e)} className="text-foreground">
                    → {labelOf(e.to)}
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          Vista orientada a implementación: credenciales reales, contratos y
          despliegue se configuran en el proyecto real. Esto es una{" "}
          <span className="font-medium text-foreground">simulación</span> para
          la demo en pantalla.
        </p>
      </div>
    </>
  );
}
