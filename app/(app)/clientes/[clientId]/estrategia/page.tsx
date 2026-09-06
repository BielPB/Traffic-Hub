import { BookOpenText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClienteEstrategiaPage() {
  return (
    <EmptyState
      icon={BookOpenText}
      title="Estratégia deste cliente ainda não implementada"
      description="Os 14 blocos estruturados de diagnóstico, persona, funil e plano de ação chegam na Fase 5."
      phase="Fase 5 · Estratégia"
    />
  );
}
