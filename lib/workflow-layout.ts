import type { WfEdge, WfNode } from "@/lib/workflow-data";

export type Positions = Record<string, { x: number; y: number }>;

const DEFAULT_OPTS = {
  hGap: 200,
  vGap: 100,
  margin: 80,
  /** Evita y≈0 en capas anchas (nodos “cortados” arriba) */
  topPad: 132,
};

/** Capas por orden topológico (Kahn). Nodos desconectados al final. */
export function topologicalLayers(
  nodes: WfNode[],
  edges: WfEdge[],
): string[][] {
  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  for (const id of ids) {
    incoming.set(id, 0);
    outgoing.set(id, []);
  }
  for (const e of edges) {
    if (!idSet.has(e.from) || !idSet.has(e.to)) continue;
    incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1);
    outgoing.get(e.from)!.push(e.to);
  }

  const layers: string[][] = [];
  let cur = ids.filter((id) => incoming.get(id) === 0);
  const placed = new Set<string>();
  let guard = 0;
  while (cur.length && guard++ < ids.length + 5) {
    layers.push([...cur]);
    cur.forEach((id) => placed.add(id));
    const next = new Set<string>();
    for (const u of cur) {
      for (const v of outgoing.get(u)!) {
        incoming.set(v, incoming.get(v)! - 1);
        if (incoming.get(v) === 0) next.add(v);
      }
    }
    cur = Array.from(next);
  }

  const missing = ids.filter((id) => !placed.has(id));
  if (missing.length) layers.push(missing);
  return layers;
}

/** Orden topológico estable: capa a capa, mismo orden que en cada capa. */
export function topologicalOrder(nodes: WfNode[], edges: WfEdge[]): string[] {
  return topologicalLayers(nodes, edges).flat();
}

export function layoutWorkflow(
  nodes: WfNode[],
  edges: WfEdge[],
  opts: Partial<typeof DEFAULT_OPTS> = {},
): Positions {
  const { hGap, vGap, margin, topPad } = { ...DEFAULT_OPTS, ...opts };
  const layers = topologicalLayers(nodes, edges);

  const pos: Positions = {};
  const minY = margin;
  layers.forEach((layer, li) => {
    const offsetY = ((layer.length - 1) * vGap) / 2;
    layer.forEach((id, j) => {
      pos[id] = {
        x: margin + li * hGap,
        y: Math.max(minY, topPad + j * vGap - offsetY),
      };
    });
  });
  return pos;
}

export function edgeKey(e: { from: string; to: string }) {
  return `${e.from}|${e.to}`;
}

/** Comprueba si añadir `edge` crea un ciclo dirigido. */
export function wouldCreateCycle(
  existing: WfEdge[],
  edge: WfEdge,
  nodeIds: Set<string>,
): boolean {
  if (edge.from === edge.to) return true;
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) adj.set(id, []);
  for (const e of existing) {
    if (e.from === e.to) continue;
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) continue;
    adj.get(e.from)!.push(e.to);
  }
  if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return false;
  adj.get(edge.from)!.push(edge.to);
  const stack = [edge.to];
  const seen = new Set<string>();
  while (stack.length) {
    const u = stack.pop()!;
    if (u === edge.from) return true;
    if (seen.has(u)) continue;
    seen.add(u);
    for (const v of adj.get(u) ?? []) stack.push(v);
  }
  return false;
}
