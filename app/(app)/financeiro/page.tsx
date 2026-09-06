import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function FinanceiroPage() {
  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Contratos, cobranças, custos e margem consolidados — contrato, custo operacional e verba de mídia sempre separados."
      />
      <EmptyState
        icon={Wallet}
        title="Controle financeiro ainda não implementado"
        description="Contratos recorrentes e avulsos, recebimentos, pendências, vencidos e margem calculada a partir dos lançamentos reais chegam na Fase 1."
        phase="Fase 1 · Núcleo operacional"
      />
    </>
  );
}
