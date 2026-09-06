import { UsersRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function EquipePage() {
  return (
    <>
      <PageHeader
        title="Equipe"
        description="Usuários, papéis e times da agência."
      />
      <EmptyState
        icon={UsersRound}
        title="Gestão de equipe ainda não implementada"
        description="Convite de usuários e atribuição de papéis chegam na Fase 6, junto do login real com Supabase Auth."
        phase="Fase 6 · Fechamento do MVP"
      />
    </>
  );
}
