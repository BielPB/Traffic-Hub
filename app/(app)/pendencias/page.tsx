import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function PendenciasPage() {
  return (
    <>
      <PageHeader
        title="Pendências"
        description="Tarefas de todos os clientes, por responsável e por vencimento."
      />
      <EmptyState
        icon={ListChecks}
        title="Gestão de pendências ainda não implementada"
        description="Tarefas vinculadas a cliente, campanha, estratégia ou lead, com prioridade, prazo e alertas internos chegam na Fase 1."
        phase="Fase 1 · Núcleo operacional"
      />
    </>
  );
}
