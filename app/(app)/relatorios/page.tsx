export const dynamic = "force-dynamic";

import Link from "next/link";
import { FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { listReports } from "@/lib/data/reports";
import { listClients } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";
import { createReportAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const user = getCurrentUser();
  const [reports, clients] = await Promise.all([listReports(user.orgId), listClients(user.orgId)]);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";

  return (
    <>
      <PageHeader title="Relatórios" description="Relatório individual por cliente ou consolidado da agência, com exportação." />

      {erro && <div className="mb-4 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{erro}</div>}

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Gerar novo relatório</h2>
        <form action={createReportAction} className="grid gap-3 sm:grid-cols-5">
          <div>
            <label className={labelClass}>Cliente</label>
            <select name="client_id" className={inputClass}>
              <option value="">Consolidado (agência)</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Início do período</label>
            <input type="date" name="period_start" defaultValue={monthStart} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Fim do período</label>
            <input type="date" name="period_end" defaultValue={today} className={inputClass} required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Análise do gestor</label>
            <input name="analysis" placeholder="Aprendizados e próximos passos" className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted sm:col-span-3">
            <input type="checkbox" name="hide_internal" defaultChecked className="size-4 rounded border-border" />
            Ocultar custos e margem internos (para apresentar ao cliente)
          </label>
          <div className="flex items-end sm:col-start-5">
            <button type="submit" className="h-10 w-full rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
              Gerar relatório
            </button>
          </div>
        </form>
      </Card>

      {reports.length === 0 ? (
        <EmptyState icon={FileBarChart} title="Nenhum relatório gerado ainda" description="Use o formulário acima para gerar o primeiro relatório." />
      ) : (
        <Card className="divide-y divide-border">
          {reports.map((r) => (
            <Link key={r.id} href={`/imprimir/relatorios/${r.id}`} target="_blank" className="flex items-center justify-between p-4 hover:bg-surface-alt">
              <div>
                <p className="text-sm font-medium text-text">
                  {r.type === "consolidado" ? "Consolidado da agência" : "Individual"} · {formatDate(r.period_start)} a {formatDate(r.period_end)}
                </p>
                <p className="text-xs text-text-faint">Gerado em {formatDate(r.generated_at)}</p>
              </div>
              <Badge tone={r.type === "consolidado" ? "purple" : "blue"}>{r.type === "consolidado" ? "Consolidado" : "Individual"}</Badge>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
