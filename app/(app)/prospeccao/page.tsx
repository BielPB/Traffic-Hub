import { KanbanSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProspeccaoPage() {
  return (
    <>
      <PageHeader
        title="Prospecção"
        description="Kanban de leads até a conversão em cliente — etapas configuráveis, sem automação de relacionamento."
      />
      <EmptyState
        icon={KanbanSquare}
        title="Kanban de prospecção ainda não implementado"
        description="Arrastar e soltar entre etapas, motivo de perda e conversão de lead em cliente sem duplicar cadastro chegam na Fase 2."
        phase="Fase 2 · Comercial"
      />
    </>
  );
}
