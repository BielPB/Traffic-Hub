import { History } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClienteAnotacoesPage() {
  return (
    <EmptyState
      icon={History}
      title="Anotações e histórico ainda não implementados"
      description="Comentários internos e o histórico de alterações (auditoria) deste cliente chegam na Fase 6."
      phase="Fase 6 · Fechamento do MVP"
    />
  );
}
