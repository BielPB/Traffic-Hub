export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/prospeccao/kanban-board";
import { listKanbanStages, listLeads, listLossReasons } from "@/lib/data/leads";
import { getCurrentUser } from "@/lib/session";

export default async function ProspeccaoPage() {
  const user = getCurrentUser();
  const [stages, leads, lossReasons] = await Promise.all([
    listKanbanStages(user.orgId),
    listLeads(user.orgId),
    listLossReasons(user.orgId),
  ]);

  const firstStage = stages[0];

  return (
    <>
      <PageHeader
        title="Prospecção"
        description="Kanban de leads até a conversão em cliente — arraste os cards entre as etapas."
        actions={
          firstStage && (
            <Link
              href={`/prospeccao/novo?etapa=${firstStage.id}`}
              className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white"
            >
              <Plus className="size-4" /> Novo lead
            </Link>
          )
        }
      />
      <KanbanBoard stages={stages} initialLeads={leads} lossReasons={lossReasons} />
    </>
  );
}
