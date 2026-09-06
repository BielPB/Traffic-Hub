export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { createClientAction } from "../actions";
import { listOrgUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";

export default async function NovoClientePage() {
  const user = getCurrentUser();
  const users = await listOrgUsers(user.orgId);

  return (
    <>
      <PageHeader title="Novo cliente" description="Cadastre um novo cliente de tráfego pago." />
      <div className="max-w-3xl">
        <ClientForm action={createClientAction} users={users} submitLabel="Criar cliente" />
      </div>
    </>
  );
}
