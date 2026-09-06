export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientViewToggle } from "@/components/clients/client-view-toggle";
import { listClients } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";

export default async function ClientesPage() {
  const user = getCurrentUser();
  const clients = await listClients(user.orgId);

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Lista e cards de todos os clientes, com status, saúde, contrato e próxima ação."
        actions={
          <Link
            href="/clientes/novo"
            className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white"
          >
            <Plus className="size-4" /> Novo cliente
          </Link>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado ainda"
          description="Cadastre o primeiro cliente para começar a acompanhar contrato, financeiro e pendências em um só lugar."
        />
      ) : (
        <ClientViewToggle clients={clients} />
      )}
    </>
  );
}
