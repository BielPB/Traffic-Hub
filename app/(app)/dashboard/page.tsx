export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { BarList } from "@/components/dashboard/bar-list";
import { formatCurrency } from "@/lib/utils";
import { summarizeCharges, currentCompetencia } from "@/lib/finance";
import { computeFormulas, sumRawMetrics } from "@/lib/metrics";
import { CLIENT_STATUS_LABELS } from "@/lib/labels";
import { listClients } from "@/lib/data/clients";
import { listChargesWithClient, listCostsForCompetencia, listMediaBudgetsForCompetencia } from "@/lib/data/financial";
import { listCampaignsWithClient, listCampaignMetricsForCampaigns } from "@/lib/data/campaigns";
import { listKanbanStages, listLeads } from "@/lib/data/leads";
import { listTasks } from "@/lib/data/tasks";
import { listOrgUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; gestor?: string }>;
}) {
  const { cliente = "todos", gestor = "todos" } = await searchParams;
  const user = getCurrentUser();
  const competencia = currentCompetencia();
  const today = new Date().toISOString().slice(0, 10);

  const [allClients, charges, costsMonth, mediaMonth, campaigns, leads, stages, tasks, users] = await Promise.all([
    listClients(user.orgId),
    listChargesWithClient(user.orgId),
    listCostsForCompetencia(user.orgId, competencia),
    listMediaBudgetsForCompetencia(user.orgId, competencia),
    listCampaignsWithClient(user.orgId),
    listLeads(user.orgId),
    listKanbanStages(user.orgId),
    listTasks(user.orgId),
    listOrgUsers(user.orgId),
  ]);

  const clients = allClients.filter((c) => {
    if (cliente !== "todos" && c.id !== cliente) return false;
    if (gestor !== "todos" && c.responsible_user_id !== gestor) return false;
    return true;
  });
  const clientIds = new Set(clients.map((c) => c.id));

  const filteredCharges = charges.filter((c) => clientIds.has(c.client_id));
  const filteredCosts = costsMonth.filter((c) => clientIds.has(c.client_id));
  const filteredMedia = mediaMonth.filter((m) => clientIds.has(m.client_id));
  const filteredCampaigns = campaigns.filter((c) => clientIds.has(c.client_id));
  const filteredLeads = leads.filter((l) => gestor === "todos" || l.responsible_id === gestor);
  const filteredTasks = tasks.filter(
    (t) => (cliente === "todos" || t.client_id === cliente) && (gestor === "todos" || t.responsible_user_id === gestor),
  );

  const chargeSummary = summarizeCharges(filteredCharges);
  const receivedThisMonth = filteredCharges.filter((c) => c.competencia === competencia).reduce((s, c) => s + c.paid_value_cents, 0);
  const contractedRevenue = clients.filter((c) => c.status !== "encerrado").reduce((s, c) => s + c.monthly_contract_value_cents, 0);
  const operationalCost = filteredCosts.reduce((s, c) => s + c.value_cents, 0);
  const mediaPlanned = filteredMedia.reduce((s, m) => s + m.planned_value_cents, 0);
  const mediaSpent = filteredMedia.reduce((s, m) => s + m.spent_value_cents, 0);
  const margin = contractedRevenue - operationalCost;

  const costsByClient = new Map<string, number>();
  for (const c of filteredCosts) costsByClient.set(c.client_id, (costsByClient.get(c.client_id) ?? 0) + c.value_cents);

  const campaignMetrics = await listCampaignMetricsForCampaigns(filteredCampaigns.map((c) => c.id));
  const totals = sumRawMetrics(campaignMetrics);
  const formulas = computeFormulas(totals);

  const overdueTasks = filteredTasks.filter((t) => t.status !== "concluida" && t.due_date && t.due_date < today).length;
  const upcomingTasks = filteredTasks.filter((t) => t.status !== "concluida" && t.due_date && t.due_date >= today).length;

  const statusCounts = { ativo: 0, onboarding: 0, planejamento: 0, atencao: 0, pausado: 0, encerrado: 0 };
  for (const c of clients) statusCounts[c.status]++;
  const criticalHealth = clients.filter((c) => c.health === "critico").length;

  const campaignStatusCounts = { planejada: 0, ativa: 0, pausada: 0, encerrada: 0 };
  for (const c of filteredCampaigns) campaignStatusCounts[c.status]++;

  return (
    <>
      <PageHeader title="Dashboard" description="Panorama executivo da agência — filtre por cliente e gestor responsável." />

      <form className="mb-6 flex flex-wrap items-center gap-2">
        <select name="cliente" defaultValue={cliente} className="h-10 rounded-lg border border-border bg-surface-alt px-3 text-sm text-text">
          <option value="todos">Todos os clientes</option>
          {allClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="gestor" defaultValue={gestor} className="h-10 rounded-lg border border-border bg-surface-alt px-3 text-sm text-text">
          <option value="todos">Todos os gestores</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button type="submit" className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-text-muted hover:bg-surface-hover">
          Filtrar
        </button>
      </form>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-faint">Clientes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Ativos" value={statusCounts.ativo} />
            <Stat label="Em onboarding" value={statusCounts.onboarding} />
            <Stat label="Pausados" value={statusCounts.pausado} />
            <Stat label="Risco (saúde crítica)" value={criticalHealth} tone="danger" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-faint">Financeiro</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Receita mensal contratada" value={formatCurrency(contractedRevenue)} />
            <Stat label={`Recebido em ${competencia}`} value={formatCurrency(receivedThisMonth)} tone="success" />
            <Stat label="Pendente" value={formatCurrency(chargeSummary.pendingCents)} tone="warning" />
            <Stat label="Vencido" value={formatCurrency(chargeSummary.overdueCents)} tone="danger" />
            <Stat label={`Custo operacional (${competencia})`} value={formatCurrency(operationalCost)} />
            <Stat label="Verba de mídia (gasto/planejado)" value={`${formatCurrency(mediaSpent)} / ${formatCurrency(mediaPlanned)}`} />
            <Stat label="Margem estimada geral" value={formatCurrency(margin)} highlight />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-faint">Performance</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Leads gerados" value={filteredLeads.length} />
            <Stat label="CPL médio" value={formulas.cplCents !== null ? formatCurrency(formulas.cplCents) : "—"} />
            <Stat label="CPA médio" value={formulas.cpaCents !== null ? formatCurrency(formulas.cpaCents) : "—"} />
            <Stat label="ROAS consolidado" value={formulas.roas !== null ? formulas.roas.toFixed(2) : "—"} highlight />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-faint">Pendências</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Vencidas" value={overdueTasks} tone="danger" />
            <Stat label="Próximas entregas" value={upcomingTasks} />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarList
            title="Clientes por status"
            items={(Object.keys(statusCounts) as (keyof typeof statusCounts)[]).map((key) => ({
              label: CLIENT_STATUS_LABELS[key],
              value: statusCounts[key],
            }))}
          />
          <BarList
            title="Funil de prospecção"
            items={stages.map((s) => ({ label: s.name, value: leads.filter((l) => l.stage_id === s.id).length }))}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarList
            title={`Receita vs. custo (${competencia})`}
            items={[
              { label: "Receita contratada", value: Math.round(contractedRevenue / 100), tone: "blue" },
              { label: "Custo operacional", value: Math.round(operationalCost / 100), tone: "warning" },
              { label: "Margem", value: Math.max(0, Math.round(margin / 100)), tone: "success" },
            ]}
          />
          <BarList
            title="Campanhas por status"
            items={[
              { label: "Ativas", value: campaignStatusCounts.ativa, tone: "success" },
              { label: "Planejadas", value: campaignStatusCounts.planejada, tone: "muted" },
              { label: "Pausadas", value: campaignStatusCounts.pausada, tone: "warning" },
              { label: "Encerradas", value: campaignStatusCounts.encerrada, tone: "danger" },
            ]}
          />
        </div>

        {costsByClient.size > 0 && (
          <Card className="overflow-x-auto p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Margem por cliente ({competencia})</h3>
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                  <th className="pb-2">Cliente</th><th className="pb-2 text-right">Contrato mensal</th><th className="pb-2 text-right">Custo do mês</th><th className="pb-2 text-right">Margem</th>
                </tr>
              </thead>
              <tbody>
                {clients.filter((c) => c.status !== "encerrado").map((c) => {
                  const cost = costsByClient.get(c.id) ?? 0;
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-2">{c.name}</td>
                      <td className="py-2 text-right">{formatCurrency(c.monthly_contract_value_cents)}</td>
                      <td className="py-2 text-right">{formatCurrency(cost)}</td>
                      <td className="py-2 text-right font-medium text-text">{formatCurrency(c.monthly_contract_value_cents - cost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, tone, highlight }: { label: string; value: string | number; tone?: "success" | "warning" | "danger"; highlight?: boolean }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : "text-text";
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-text-faint">{label}</p>
      <p className={`mt-1.5 text-lg font-semibold ${highlight ? "text-purple-dark" : toneClass}`}>{value}</p>
    </Card>
  );
}
