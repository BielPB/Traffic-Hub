export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LeadForm } from "@/components/prospeccao/lead-form";
import { createLeadAction } from "../actions";
import { listKanbanStages } from "@/lib/data/leads";
import { listOrgUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";

export default async function NovoLeadPage({ searchParams }: { searchParams: Promise<{ etapa?: string }> }) {
  const { etapa } = await searchParams;
  const user = getCurrentUser();
  const [stages, users] = await Promise.all([listKanbanStages(user.orgId), listOrgUsers(user.orgId)]);
  const stageId = etapa ?? stages[0]?.id;
  if (!stageId) notFound();

  return (
    <>
      <PageHeader title="Novo lead" description="Cadastre um novo lead na etapa inicial de prospecção." />
      <LeadForm action={createLeadAction.bind(null, stageId)} users={users} submitLabel="Criar lead" />
    </>
  );
}
