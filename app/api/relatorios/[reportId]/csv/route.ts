import { NextResponse } from "next/server";
import { getReport, buildReportData } from "@/lib/data/reports";
import { computeFormulas } from "@/lib/metrics";
import { getCurrentUser } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const user = getCurrentUser();
  const report = await getReport(user.orgId, reportId);
  if (!report) return new NextResponse("Relatório não encontrado", { status: 404 });

  const data = await buildReportData(user.orgId, report.client_id, report.period_start, report.period_end);
  const formulas = computeFormulas(data.raw);
  const hideInternal = report.config.hideInternal ?? false;

  const rows: [string, string | number][] = [
    ["Período", `${report.period_start} a ${report.period_end}`],
    ["Cliente", data.clientNames.join(", ") || "Consolidado"],
    ["Recebido (centavos)", data.received],
    ["Pendente (centavos)", data.pending],
    ["Vencido (centavos)", data.overdue],
    ["Impressões", data.raw.impressions],
    ["Cliques", data.raw.clicks],
    ["Leads", data.raw.leads],
    ["Conversões", data.raw.conversions],
    ["Investido (centavos)", data.raw.spent_cents],
    ["Receita atribuída (centavos)", data.raw.attributed_revenue_cents],
    ["ROAS", formulas.roas ?? ""],
  ];
  if (!hideInternal) rows.push(["Custo operacional (centavos)", data.operationalCost]);

  const csv = ["Métrica,Valor", ...rows.map(([k, v]) => `"${k}",${v}`)].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-${reportId}.csv"`,
    },
  });
}
