export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { computeFormulas, formatPercent, formatRatio, sumRawMetrics } from "@/lib/metrics";
import { getCampaign, listCampaignMetrics } from "@/lib/data/campaigns";
import { getCurrentUser } from "@/lib/session";
import { upsertCampaignMetricAction, setCampaignStatusAction } from "../actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";

const STATUS_TONE = { planejada: "muted", ativa: "success", pausada: "warning", encerrada: "danger" } as const;
const STATUS_LABEL = { planejada: "Planejada", ativa: "Ativa", pausada: "Pausada", encerrada: "Encerrada" } as const;

export default async function CampanhaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; campaignId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { clientId, campaignId } = await params;
  const { erro } = await searchParams;
  const user = getCurrentUser();
  const [campaign, metrics] = await Promise.all([
    getCampaign(user.orgId, campaignId),
    listCampaignMetrics(campaignId),
  ]);
  if (!campaign) notFound();

  const totals = sumRawMetrics(metrics);
  const totalFormulas = computeFormulas(totals);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {erro && <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{erro}</div>}

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text">{campaign.name}</h2>
              <Badge tone={STATUS_TONE[campaign.status]}>{STATUS_LABEL[campaign.status]}</Badge>
            </div>
            <p className="text-sm text-text-faint">{campaign.platform}{campaign.objective ? ` · ${campaign.objective}` : ""}</p>
          </div>
          <form action={setCampaignStatusAction.bind(null, clientId, campaignId, campaign.status === "encerrada" ? "ativa" : "encerrada")}>
            <button className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-hover">
              {campaign.status === "encerrada" ? "Reativar" : "Encerrar campanha"}
            </button>
          </form>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Orçamento" value={formatCurrency(campaign.budget_cents)} />
          <Stat label="Investido (total)" value={formatCurrency(campaign.spent_cents)} />
          <Stat label="Página de destino" value={campaign.landing_page ?? "—"} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Resultados consolidados</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Impressões" value={totals.impressions.toLocaleString("pt-BR")} />
          <Stat label="Cliques" value={totals.clicks.toLocaleString("pt-BR")} />
          <Stat label="CTR" value={formatPercent(totalFormulas.ctr)} />
          <Stat label="CPC" value={totalFormulas.cpcCents !== null ? formatCurrency(totalFormulas.cpcCents) : "—"} />
          <Stat label="Leads" value={totals.leads.toLocaleString("pt-BR")} />
          <Stat label="CPL" value={totalFormulas.cplCents !== null ? formatCurrency(totalFormulas.cplCents) : "—"} />
          <Stat label="Conversões" value={totals.conversions.toLocaleString("pt-BR")} />
          <Stat label="Taxa de conversão" value={formatPercent(totalFormulas.conversionRate)} />
          <Stat label="CPA" value={totalFormulas.cpaCents !== null ? formatCurrency(totalFormulas.cpaCents) : "—"} />
          <Stat label="Receita atribuída" value={formatCurrency(totals.attributed_revenue_cents)} />
          <Stat label="ROAS" value={formatRatio(totalFormulas.roas)} highlight />
          <Stat label="Agend. / Compar. / Vendas" value={`${totals.appointments} / ${totals.shows} / ${totals.sales}`} />
        </div>
      </Card>

      <Card className="overflow-x-auto p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Lançamentos por período</h3>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
              <th className="pb-2">Período</th><th className="pb-2">Impr.</th><th className="pb-2">Cliques</th><th className="pb-2">CTR</th><th className="pb-2">Leads</th><th className="pb-2">CPL</th><th className="pb-2">Convers.</th><th className="pb-2">Investido</th><th className="pb-2">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {metrics.length === 0 && (
              <tr><td colSpan={9} className="py-4 text-text-faint">Nenhum lançamento ainda.</td></tr>
            )}
            {metrics.map((m) => {
              const f = computeFormulas(m);
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="py-2.5">{m.period}</td>
                  <td className="py-2.5">{m.impressions.toLocaleString("pt-BR")}</td>
                  <td className="py-2.5">{m.clicks.toLocaleString("pt-BR")}</td>
                  <td className="py-2.5">{formatPercent(f.ctr)}</td>
                  <td className="py-2.5">{m.leads}</td>
                  <td className="py-2.5">{f.cplCents !== null ? formatCurrency(f.cplCents) : "—"}</td>
                  <td className="py-2.5">{m.conversions}</td>
                  <td className="py-2.5 font-medium">{formatCurrency(m.spent_cents)}</td>
                  <td className="py-2.5">{formatRatio(f.roas)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <form action={upsertCampaignMetricAction.bind(null, clientId, campaignId)} className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-5">
          <div>
            <label className={labelClass}>Período (dia de referência)</label>
            <input type="date" name="period" defaultValue={today} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Impressões</label>
            <input type="number" name="impressions" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Alcance</label>
            <input type="number" name="reach" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Cliques</label>
            <input type="number" name="clicks" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Leads</label>
            <input type="number" name="leads" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Conversões</label>
            <input type="number" name="conversions" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Agendamentos</label>
            <input type="number" name="appointments" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Comparecimentos</label>
            <input type="number" name="shows" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Vendas</label>
            <input type="number" name="sales" min={0} className={inputClass} defaultValue={0} />
          </div>
          <div>
            <label className={labelClass}>Investido (R$)</label>
            <input name="spent" placeholder="500,00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Receita atribuída (R$)</label>
            <input name="attributed_revenue" placeholder="1500,00" className={inputClass} />
          </div>
          <div className="flex items-end sm:col-start-5">
            <button type="submit" className="h-10 w-full rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
              Lançar período
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-text-faint">{label}</p>
      <p className={`mt-1 text-base font-semibold ${highlight ? "text-purple-dark" : "text-text"}`}>{value}</p>
    </div>
  );
}
