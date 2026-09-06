export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { updateClientAction } from "../../actions";
import { getClient } from "@/lib/data/clients";
import { listOrgUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";

export default async function EditarClientePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const user = getCurrentUser();
  const [client, users] = await Promise.all([getClient(user.orgId, clientId), listOrgUsers(user.orgId)]);
  if (!client) notFound();

  const boundAction = updateClientAction.bind(null, clientId);

  return (
    <>
      <PageHeader title={`Editar ${client.name}`} description="Atualize os dados do cliente." />
      <div className="max-w-3xl">
        <ClientForm action={boundAction} users={users} defaultValues={client} submitLabel="Salvar alterações" />
      </div>
    </>
  );
}
