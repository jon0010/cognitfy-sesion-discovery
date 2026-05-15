import type { Metadata } from "next";
import { WorkflowEditor } from "@/components/workflow-editor/workflow-editor";

export const metadata: Metadata = {
  title: "Pizarra de flujos | Cognitfy",
  description:
    "Explora casos de uso e integraciones en un lienzo tipo n8n: nodos, orden y edición con paleta.",
};

export default function FlujoPage() {
  return <WorkflowEditor />;
}
