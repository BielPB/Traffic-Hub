import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function EstrategiasPage() {
  return (
    <>
      <PageHeader
        title="Estratégias"
        description="Modelos de estratégia e visão geral das estratégias documentadas por cliente."
      />
      <EmptyState
        icon={BookOpenText}
        title="Biblioteca de estratégias ainda não implementada"
        description="Os 14 blocos estruturados (diagnóstico, persona, funil, linha de criativos, plano de ação...), com versões e modelos duplicáveis, chegam na Fase 5."
        phase="Fase 5 · Estratégia"
      />
    </>
  );
}
