import { FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function RelatoriosPage() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Relatório individual por cliente e consolidado da agência, prontos para apresentar ao cliente."
      />
      <EmptyState
        icon={FileBarChart}
        title="Geração de relatórios ainda não implementada"
        description="Seleção de período e métricas, comparação com metas, exportação em PDF/CSV e ocultação de dados internos chegam na Fase 6."
        phase="Fase 6 · Fechamento do MVP"
      />
    </>
  );
}
