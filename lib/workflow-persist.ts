import type { WfEdge, WfNode } from "@/lib/workflow-data";
import type { Positions } from "@/lib/workflow-layout";

export const WF_STORAGE_KEY = "cognitfy-workflow-board-v1";

const SCHEMA_V = 1 as const;

export type WfSnapshot = {
  nodes: WfNode[];
  edges: WfEdge[];
  positions: Positions;
  zoom?: number;
};

type RootDoc = {
  v: typeof SCHEMA_V;
  byPreset: Record<string, WfSnapshot>;
};

function emptyRoot(): RootDoc {
  return { v: SCHEMA_V, byPreset: {} };
}

function readRoot(): RootDoc {
  if (typeof window === "undefined") return emptyRoot();
  try {
    const raw = localStorage.getItem(WF_STORAGE_KEY);
    if (!raw) return emptyRoot();
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return emptyRoot();
    const o = parsed as Partial<RootDoc>;
    if (o.v !== SCHEMA_V || !o.byPreset || typeof o.byPreset !== "object")
      return emptyRoot();
    return { v: SCHEMA_V, byPreset: { ...o.byPreset } };
  } catch {
    return emptyRoot();
  }
}

function writeRoot(doc: RootDoc) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WF_STORAGE_KEY, JSON.stringify(doc));
  } catch {
    /* quota / modo privado */
  }
}

export function validateSnapshot(s: WfSnapshot): boolean {
  if (!s?.nodes?.length) return false;
  const ids = new Set(s.nodes.map((n) => n.id));
  for (const e of s.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) return false;
  }
  for (const id of ids) {
    const pos = s.positions[id];
    if (
      !pos ||
      typeof pos.x !== "number" ||
      typeof pos.y !== "number" ||
      Number.isNaN(pos.x) ||
      Number.isNaN(pos.y)
    ) {
      return false;
    }
  }
  return true;
}

export function readPresetSnapshot(presetId: string): WfSnapshot | null {
  const doc = readRoot();
  const snap = doc.byPreset[presetId];
  if (!snap || !validateSnapshot(snap)) return null;
  return snap;
}

export function writePresetSnapshot(presetId: string, snap: WfSnapshot) {
  if (!validateSnapshot(snap)) return;
  const doc = readRoot();
  doc.byPreset[presetId] = {
    nodes: snap.nodes,
    edges: snap.edges,
    positions: snap.positions,
    ...(typeof snap.zoom === "number" &&
    !Number.isNaN(snap.zoom) &&
    snap.zoom > 0
      ? { zoom: snap.zoom }
      : {}),
  };
  writeRoot(doc);
}
