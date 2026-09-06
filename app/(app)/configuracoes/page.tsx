import { Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Identidade da agência, moeda, etapas do Kanban, categorias de custo, templates e notificações."
      />
      <EmptyState
        icon={Settings}
        title="Configurações ainda não implementadas"
        description="Nome/logo da agência, etapas do Kanban, motivos de perda, categorias de custo e templates de estratégia/relatório chegam na Fase 6."
        phase="Fase 6 · Fechamento do MVP"
      />
    </>
  );
}
