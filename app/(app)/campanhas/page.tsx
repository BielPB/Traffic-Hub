import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CampanhasPage() {
  return (
    <>
      <PageHeader
        title="Campanhas"
        description="Campanhas por cliente e plataforma — Meta Ads, Google Ads, TikTok Ads e outras fontes configuráveis."
      />
      <EmptyState
        icon={Megaphone}
        title="Cadastro de campanhas ainda não implementado"
        description="Lançamento manual por cliente/plataforma, com orçamento, investimento, público e criativos relacionados chega na Fase 3."
        phase="Fase 3 · Performance"
      />
    </>
  );
}
