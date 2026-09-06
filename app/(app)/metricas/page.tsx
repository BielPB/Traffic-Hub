export const dynamic = "force-dynamic";

import { LineChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { computeFormulas, formatPercent, formatRatio, sumRawMetrics } from "@/lib/metrics";
import { listCampaignsWithClient, listCampaignMetricsForCampaigns } from "@/lib/data/campaigns";
import { listClients } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";

export default async function MetricasPage() {
  const user = getCurrentUser();
  const [campaigns, clients] = await Promise.all([listCampaignsWithClient(user.orgId), listClients(user.orgId)]);
  const allMetrics = await listCampaignMetricsForCampaigns(campaigns.map((c) => c.id));

  const rows = campaigns.map((campaign) => {
    const campaignMetrics = allMetrics.filter((m) => m.campaign_id === campaign.id);
    const totals = sumRawMetrics(campaignMetrics);
    const formulas = computeFormulas(totals);
    return { campaign, totals, formulas };
  });

  const consolidated = sumRawMetrics(rows.map((r) => r.totals));
  const consolidatedFormulas = computeFormulas(consolidated);

  return (
    <>
      <PageHeader
        title="Métricas"
        description="Comparação de desempenho entre campanhas e clientes — leads, CPL, CPA e ROAS consolidados."
      />

      {campaigns.length === 0 ? (
        <EmptyState icon={LineChart} title="Ainda não há métricas para comparar" description="Lance resultados nas campanhas de cada cliente para ver a comparação aqui." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Leads gerados" value={consolidated.leads.toLocaleString("pt-BR")} />
            <Stat label="CPL médio" value={consolidatedFormulas.cplCents !== null ? formatCurrency(consolidatedFormulas.cplCents) : "—"} />
            <Stat label="CPA médio" value={consolidatedFormulas.cpaCents !== null ? formatCurrency(consolidatedFormulas.cpaCents) : "—"} />
            <Stat label="ROAS consolidado" value={formatRatio(consolidatedFormulas.roas)} highlight />
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                  <th className="px-4 py-3">Campanha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                  <th className="px-4 py-3 text-right">CPC</th>
                  <th className="px-4 py-3 text-right">Leads</th>
                  <th className="px-4 py-3 text-right">CPL</th>
                  <th className="px-4 py-3 text-right">Convers.</th>
                  <th className="px-4 py-3 text-right">CPA</th>
                  <th className="px-4 py-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ campaign, totals, formulas }) => (
                  <tr key={campaign.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                    <td className="px-4 py-3 font-medium text-text">{campaign.name}</td>
                    <td className="px-4 py-3 text-text-muted">{campaign.client?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{formatPercent(formulas.ctr)}</td>
                    <td className="px-4 py-3 text-right">{formulas.cpcCents !== null ? formatCurrency(formulas.cpcCents) : "—"}</td>
                    <td className="px-4 py-3 text-right">{totals.leads}</td>
                    <td className="px-4 py-3 text-right">{formulas.cplCents !== null ? formatCurrency(formulas.cplCents) : "—"}</td>
                    <td className="px-4 py-3 text-right">{totals.conversions}</td>
                    <td className="px-4 py-3 text-right">{formulas.cpaCents !== null ? formatCurrency(formulas.cpaCents) : "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-purple-dark">{formatRatio(formulas.roas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {clients.length > 0 && (
            <p className="text-xs text-text-faint">
              Metas por métrica são definidas na aba Campanhas de cada cliente e comparadas lá com o resultado do período.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-text-faint">{label}</p>
      <p className={`mt-1.5 text-lg font-semibold ${highlight ? "text-purple-dark" : "text-text"}`}>{value}</p>
    </Card>
  );
}
