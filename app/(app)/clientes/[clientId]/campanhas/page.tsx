export const dynamic = "force-dynamic";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { listCampaigns, listMetricGoals } from "@/lib/data/campaigns";
import { getCurrentUser } from "@/lib/session";
import { createCampaignAction, createMetricGoalAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";

const STATUS_TONE = { planejada: "muted", ativa: "success", pausada: "warning", encerrada: "danger" } as const;
const STATUS_LABEL = { planejada: "Planejada", ativa: "Ativa", pausada: "Pausada", encerrada: "Encerrada" } as const;
const METRIC_OPTIONS = [
  { value: "cpl", label: "CPL (custo por lead)" },
  { value: "cpa", label: "CPA (custo por conversão)" },
  { value: "roas", label: "ROAS" },
  { value: "ctr", label: "CTR" },
];

export default async function ClienteCampanhasPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { clientId } = await params;
  const { erro } = await searchParams;
  const user = getCurrentUser();
  const [campaigns, goals] = await Promise.all([
    listCampaigns(user.orgId, clientId),
    listMetricGoals(user.orgId, clientId),
  ]);

  return (
    <div className="space-y-8">
      {erro && <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{erro}</div>}

      <section>
        {campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} title="Nenhuma campanha cadastrada" description="Cadastre a primeira campanha deste cliente abaixo." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {campaigns.map((c) => (
              <Link key={c.id} href={`/clientes/${clientId}/campanhas/${c.id}`}>
                <Card className="p-4 transition-colors hover:border-border-strong">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="font-medium text-text">{c.name}</p>
                    <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                  </div>
                  <p className="mb-3 text-xs text-text-faint">{c.platform}{c.objective ? ` · ${c.objective}` : ""}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-faint">Orçamento / Investido</span>
                    <span className="font-medium text-text">{formatCurrency(c.budget_cents)} / {formatCurrency(c.spent_cents)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Nova campanha</h2>
        <form action={createCampaignAction.bind(null, clientId)} className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input name="name" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Plataforma</label>
            <input name="platform" placeholder="Meta Ads" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Objetivo</label>
            <input name="objective" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue="planejada" className={inputClass}>
              <option value="planejada">Planejada</option>
              <option value="ativa">Ativa</option>
              <option value="pausada">Pausada</option>
              <option value="encerrada">Encerrada</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Início</label>
            <input type="date" name="period_start" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fim</label>
            <input type="date" name="period_end" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Orçamento (R$)</label>
            <input name="budget" placeholder="2000,00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Página de destino</label>
            <input name="landing_page" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Público</label>
            <input name="audience" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Oferta</label>
            <input name="offer" className={inputClass} />
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <button type="submit" className="h-10 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
              Adicionar campanha
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Metas por métrica</h2>
        {goals.length > 0 && (
          <ul className="mb-4 space-y-1.5 text-sm">
            {goals.map((g) => (
              <li key={g.id} className="flex justify-between border-b border-border pb-1.5 text-text-muted">
                <span>{METRIC_OPTIONS.find((m) => m.value === g.metric_name)?.label ?? g.metric_name} — {g.period}</span>
                <span className="font-medium text-text">{g.target_value}</span>
              </li>
            ))}
          </ul>
        )}
        <form action={createMetricGoalAction.bind(null, clientId)} className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Métrica</label>
            <select name="metric_name" className={inputClass}>
              {METRIC_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Meta</label>
            <input name="target_value" placeholder="Ex.: 30 (ROAS) ou 15 (CPL em R$)" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Período (AAAA-MM)</label>
            <input name="period" placeholder="2026-09" className={inputClass} required />
          </div>
          <div className="flex items-end">
            <button type="submit" className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-surface-hover">
              Definir meta
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
