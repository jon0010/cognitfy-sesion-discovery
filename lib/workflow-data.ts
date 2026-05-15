import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  CreditCard,
  FileSpreadsheet,
  Headphones,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  Receipt,
  ShoppingCart,
  Slack,
  Webhook,
  Zap,
} from "lucide-react";

export type NodeKind =
  | "trigger"
  | "integration"
  | "cognitfy"
  | "action"
  | "outcome";

export type WfNode = {
  id: string;
  kind: NodeKind;
  label: string;
  subtitle?: string;
  integrationKey?: string;
};

export type WfEdge = { from: string; to: string };

export type WorkflowPreset = {
  id: string;
  name: string;
  description: string;
  nodes: WfNode[];
  edges: WfEdge[];
};

export type IntegrationDef = {
  key: string;
  name: string;
  Icon: LucideIcon;
};

/** Paleta ampliable: arrastrar al canvas añade el nodo y se recalcula el layout */
export const INTEGRATION_CATALOG: IntegrationDef[] = [
  { key: "gmail", name: "Gmail", Icon: Mail },
  { key: "slack", name: "Slack", Icon: Slack },
  { key: "teams", name: "Microsoft Teams", Icon: MessageSquare },
  { key: "salesforce", name: "Salesforce", Icon: Zap },
  { key: "hubspot", name: "HubSpot", Icon: ShoppingCart },
  { key: "sheets", name: "Google Sheets", Icon: FileSpreadsheet },
  { key: "stripe", name: "Stripe", Icon: CreditCard },
  { key: "zendesk", name: "Zendesk", Icon: Headphones },
  { key: "twilio", name: "Twilio / VoIP", Icon: Phone },
  { key: "mercadopago", name: "Mercado Pago", Icon: Banknote },
  { key: "facturae", name: "Facturación / ERP", Icon: Receipt },
  { key: "webhook", name: "Webhook genérico", Icon: Webhook },
  { key: "inbox", name: "Bandeja unificada", Icon: Inbox },
];

export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: "atencion",
    name: "Atención al cliente",
    description: "Consulta multicanal → contexto en CRM → Cognitfy → respuesta y ticket.",
    nodes: [
      {
        id: "at-tr",
        kind: "trigger",
        label: "Entrada",
        subtitle: "Web · WhatsApp · email",
      },
      {
        id: "at-crm",
        kind: "integration",
        label: "CRM",
        subtitle: "Historial del cliente",
        integrationKey: "salesforce",
      },
      {
        id: "at-cf",
        kind: "cognitfy",
        label: "Cognitfy",
        subtitle: "Clasifica y decide el siguiente paso",
      },
      {
        id: "at-zd",
        kind: "integration",
        label: "Mesa de ayuda",
        subtitle: "Ticket y seguimiento",
        integrationKey: "zendesk",
      },
      {
        id: "at-out",
        kind: "outcome",
        label: "Resuelto",
        subtitle: "Cliente informado · SLA trazado",
      },
    ],
    edges: [
      { from: "at-tr", to: "at-crm" },
      { from: "at-crm", to: "at-cf" },
      { from: "at-cf", to: "at-zd" },
      { from: "at-zd", to: "at-out" },
    ],
  },
  {
    id: "ventas",
    name: "Lead inbound",
    description: "Formulario o anuncio → datos en CRM → aviso al equipo en Slack.",
    nodes: [
      {
        id: "vn-tr",
        kind: "trigger",
        label: "Captación",
        subtitle: "Formulario / campaña",
      },
      {
        id: "vn-hs",
        kind: "integration",
        label: "CRM marketing",
        subtitle: "Lead y scoring",
        integrationKey: "hubspot",
      },
      {
        id: "vn-cf",
        kind: "cognitfy",
        label: "Cognitfy",
        subtitle: "Prioriza y enriquece",
      },
      {
        id: "vn-sl",
        kind: "integration",
        label: "Equipo comercial",
        subtitle: "Notificación inmediata",
        integrationKey: "slack",
      },
      {
        id: "vn-out",
        kind: "outcome",
        label: "Oportunidad",
        subtitle: "Asignado y con contexto",
      },
    ],
    edges: [
      { from: "vn-tr", to: "vn-hs" },
      { from: "vn-hs", to: "vn-cf" },
      { from: "vn-cf", to: "vn-sl" },
      { from: "vn-sl", to: "vn-out" },
    ],
  },
  {
    id: "facturacion",
    name: "Pedido → cobro",
    description: "Pedido validado → ERP → aviso y cobro con Stripe.",
    nodes: [
      {
        id: "fa-tr",
        kind: "trigger",
        label: "Pedido",
        subtitle: "Tienda o presupuesto",
      },
      {
        id: "fa-erp",
        kind: "integration",
        label: "ERP / stock",
        subtitle: "Validación y reserva",
        integrationKey: "facturae",
      },
      {
        id: "fa-cf",
        kind: "cognitfy",
        label: "Cognitfy",
        subtitle: "Reglas de negocio y excepciones",
      },
      {
        id: "fa-st",
        kind: "integration",
        label: "Cobro",
        subtitle: "Link o cargo recurrente",
        integrationKey: "stripe",
      },
      {
        id: "fa-out",
        kind: "outcome",
        label: "Cerrado",
        subtitle: "Factura · pago · registro",
      },
    ],
    edges: [
      { from: "fa-tr", to: "fa-erp" },
      { from: "fa-erp", to: "fa-cf" },
      { from: "fa-cf", to: "fa-st" },
      { from: "fa-st", to: "fa-out" },
    ],
  },
];

export function getIntegrationIcon(key: string): LucideIcon | null {
  const row = INTEGRATION_CATALOG.find((i) => i.key === key);
  return row?.Icon ?? null;
}
