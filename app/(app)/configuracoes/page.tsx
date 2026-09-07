export const dynamic = "force-dynamic";

import { ArrowUp, ArrowDown, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { getOrganization } from "@/lib/data/organizations";
import { listKanbanStages, listLossReasons } from "@/lib/data/leads";
import { listCostCategories } from "@/lib/data/financial";
import { getCurrentUser } from "@/lib/session";
import {
  updateOrganizationAction,
  createKanbanStageAction,
  deleteKanbanStageAction,
  moveKanbanStageAction,
  createLossReasonAction,
  deleteLossReasonAction,
  createCostCategoryAction,
  deleteCostCategoryAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";

function swap(ids: string[], i: number, j: number): string[] {
  const copy = [...ids];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export default async function ConfiguracoesPage() {
  const user = getCurrentUser();
  const [org, stages, lossReasons, costCategories] = await Promise.all([
    getOrganization(user.orgId),
    listKanbanStages(user.orgId),
    listLossReasons(user.orgId),
    listCostCategories(user.orgId),
  ]);
  const stageIds = stages.map((s) => s.id);

  return (
    <>
      <PageHeader title="Configurações" description="Identidade da agência, etapas do Kanban, motivos de perda e categorias de custo." />

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Identidade da agência</h2>
          <form action={updateOrganizationAction} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nome</label>
              <input name="name" defaultValue={org?.name} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>URL do logo</label>
              <input name="logo_url" defaultValue={org?.logo_url ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Moeda</label>
              <input name="currency" defaultValue={org?.currency} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Formato de data</label>
              <input name="date_format" defaultValue={org?.date_format} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fuso horário</label>
              <input name="timezone" defaultValue={org?.timezone} className={inputClass} />
            </div>
            <div className="flex items-end sm:col-start-2 sm:justify-end">
              <button type="submit" className="h-10 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
                Salvar
              </button>
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Etapas do Kanban</h2>
          <ul className="mb-4 space-y-1.5">
            {stages.map((stage, index) => (
              <li key={stage.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="text-text">{stage.name}</span>
                <div className="flex gap-1">
                  {index > 0 && (
                    <form action={moveKanbanStageAction.bind(null, swap(stageIds, index, index - 1))}>
                      <button className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover"><ArrowUp className="size-3.5" /></button>
                    </form>
                  )}
                  {index < stages.length - 1 && (
                    <form action={moveKanbanStageAction.bind(null, swap(stageIds, index, index + 1))}>
                      <button className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover"><ArrowDown className="size-3.5" /></button>
                    </form>
                  )}
                  <form action={deleteKanbanStageAction.bind(null, stage.id)}>
                    <ConfirmButton message={`Remover a etapa "${stage.name}"?`} className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-danger-bg hover:text-danger">
                      <X className="size-3.5" />
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <form action={createKanbanStageAction.bind(null, stages.length)} className="flex gap-2">
            <input name="name" placeholder="Nova etapa" className={inputClass} required />
            <button type="submit" className="h-10 shrink-0 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-surface-hover">Adicionar</button>
          </form>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Motivos de perda</h2>
            <ul className="mb-4 space-y-1.5">
              {lossReasons.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="text-text">{r.name}</span>
                  <form action={deleteLossReasonAction.bind(null, r.id)}>
                    <ConfirmButton message={`Remover "${r.name}"?`} className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-danger-bg hover:text-danger">
                      <X className="size-3.5" />
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
            <form action={createLossReasonAction} className="flex gap-2">
              <input name="name" placeholder="Novo motivo" className={inputClass} required />
              <button type="submit" className="h-10 shrink-0 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-surface-hover">Adicionar</button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Categorias de custo</h2>
            <ul className="mb-4 space-y-1.5">
              {costCategories.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="text-text">{c.name}</span>
                  <form action={deleteCostCategoryAction.bind(null, c.id)}>
                    <ConfirmButton message={`Remover "${c.name}"?`} className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-danger-bg hover:text-danger">
                      <X className="size-3.5" />
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
            <form action={createCostCategoryAction} className="flex gap-2">
              <input name="name" placeholder="Nova categoria" className={inputClass} required />
              <button type="submit" className="h-10 shrink-0 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-surface-hover">Adicionar</button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
