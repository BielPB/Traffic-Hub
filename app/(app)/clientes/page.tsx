import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClientesPage() {
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Lista e cards de todos os clientes, com status, saúde, contrato e próxima ação."
      />
      <EmptyState
        icon={Users}
        title="Cadastro de clientes ainda não implementado"
        description="Lista/cards com status, saúde do cliente, contrato, financeiro resumido e a página de detalhe com todas as abas chegam na Fase 1."
        phase="Fase 1 · Núcleo operacional"
      />
    </>
  );
}
