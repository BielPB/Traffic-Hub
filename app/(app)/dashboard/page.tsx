import { LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Panorama executivo da agência: clientes, financeiro, campanhas e prospecção em um só lugar."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="O painel consolidado chega depois dos módulos que ele resume"
        description="Os KPIs (receita, margem, ROAS, funil de prospecção etc.) são derivados de Clientes, Financeiro, Campanhas e Prospecção — por isso o dashboard fecha o ciclo, na Fase 4."
        phase="Fase 4 · Consolidação"
      />
    </>
  );
}
