export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ArrowRightCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LeadForm } from "@/components/prospeccao/lead-form";
import { updateLeadAction, convertLeadAction } from "../../actions";
import { getLead, listKanbanStages } from "@/lib/data/leads";
import { listOrgUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";

export default async function EditarLeadPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const user = getCurrentUser();
  const [lead, users, stages] = await Promise.all([
    getLead(user.orgId, leadId),
    listOrgUsers(user.orgId),
    listKanbanStages(user.orgId),
  ]);
  if (!lead) notFound();

  const stage = stages.find((s) => s.id === lead.stage_id);
  const canConvert = stage?.name === "Fechado" && !lead.converted_client_id;

  return (
    <>
      <PageHeader
        title={`Editar ${lead.name}`}
        description={`Etapa atual: ${stage?.name ?? "—"}`}
        actions={
          canConvert ? (
            <form action={convertLeadAction.bind(null, leadId)}>
              <button className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
                <ArrowRightCircle className="size-4" /> Converter em cliente
              </button>
            </form>
          ) : undefined
        }
      />
      <LeadForm action={updateLeadAction.bind(null, leadId)} users={users} defaultValues={lead} submitLabel="Salvar alterações" />
    </>
  );
}
