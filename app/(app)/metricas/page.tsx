import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function MetricasPage() {
  return (
    <>
      <PageHeader
        title="Métricas"
        description="Comparação de desempenho entre campanhas, clientes e períodos, com metas por métrica."
      />
      <EmptyState
        icon={LineChart}
        title="Comparação de métricas ainda não implementada"
        description="CTR, CPC, CPL, CPA, ROAS e demais fórmulas calculadas automaticamente a partir dos dados de campanha chegam na Fase 3, junto do cadastro de campanhas."
        phase="Fase 3 · Performance"
      />
    </>
  );
}
