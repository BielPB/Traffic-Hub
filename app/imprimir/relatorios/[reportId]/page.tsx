export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { computeFormulas, formatPercent, formatRatio } from "@/lib/metrics";
import { getReport, buildReportData } from "@/lib/data/reports";
import { getCurrentUser } from "@/lib/session";
import { PrintButton } from "@/components/reports/print-button";

function delta(current: number, previous: number): string {
  if (previous === 0) {
    return current === 0 ? "sem variação vs. período anterior" : "sem dado no período anterior";
  }
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% vs. período anterior`;
}

export default async function ImprimirRelatorioPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const user = getCurrentUser();
  const report = await getReport(user.orgId, reportId);
  if (!report) notFound();

  const data = await buildReportData(user.orgId, report.client_id, report.period_start, report.period_end);
  const formulas = computeFormulas(data.raw);
  const hideInternal = report.config.hideInternal ?? false;

  return (
    <div className="mx-auto min-h-dvh max-w-3xl bg-bg px-6 py-10 text-text print:px-0 print:py-0">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <a href="/relatorios" className="text-sm text-text-muted hover:underline">← Voltar para Relatórios</a>
        <div className="flex gap-2">
          <a
            href={`/api/relatorios/${reportId}/csv`}
            className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text-muted hover:bg-surface-hover"
          >
            <Download className="size-4" /> Exportar CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <header className="mb-8 border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-dark">
          {report.type === "consolidado" ? "Relatório consolidado" : "Relatório individual"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text">
          {report.type === "consolidado" ? "Traffic Hub Demo" : data.clientNames[0] ?? "Cliente"}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Período: {formatDate(report.period_start)} a {formatDate(report.period_end)}
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Financeiro</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Recebido" value={formatCurrency(data.received)} sub={delta(data.received, data.previous.received)} />
          <Stat label="Pendente" value={formatCurrency(data.pending)} />
          <Stat label="Vencido" value={formatCurrency(data.overdue)} />
          {!hideInternal && <Stat label="Custo operacional" value={formatCurrency(data.operationalCost)} />}
          {!hideInternal && <Stat label="Margem estimada" value={formatCurrency(data.received - data.operationalCost)} />}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Performance</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Impressões" value={data.raw.impressions.toLocaleString("pt-BR")} />
          <Stat label="Cliques" value={data.raw.clicks.toLocaleString("pt-BR")} />
          <Stat label="CTR" value={formatPercent(formulas.ctr)} />
          <Stat label="Leads" value={data.raw.leads.toLocaleString("pt-BR")} sub={delta(data.raw.leads, data.previous.leads)} />
          <Stat label="Conversões" value={data.raw.conversions.toLocaleString("pt-BR")} />
          <Stat label="ROAS" value={formatRatio(formulas.roas)} />
        </div>
      </section>

      {report.config.analysis && (
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-faint">Análise do gestor</h2>
          <p className="whitespace-pre-wrap text-sm text-text-muted">{report.config.analysis}</p>
        </section>
      )}

      <footer className="mt-10 border-t border-border pt-4 text-xs text-text-faint">
        Gerado em {formatDate(report.generated_at)} pelo Traffic Hub.
      </footer>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-text-faint">{label}</p>
      <p className="mt-1 text-base font-semibold text-text">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-faint">{sub}</p>}
    </div>
  );
}
