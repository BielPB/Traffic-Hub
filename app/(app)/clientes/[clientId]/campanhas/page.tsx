import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClienteCampanhasPage() {
  return (
    <EmptyState
      icon={Megaphone}
      title="Campanhas e métricas deste cliente ainda não implementadas"
      description="Cadastro de campanhas por plataforma e as métricas calculadas automaticamente chegam na Fase 3."
      phase="Fase 3 · Performance"
    />
  );
}
