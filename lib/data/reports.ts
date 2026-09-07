import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeCharges } from "@/lib/finance";
import { computeFormulas, sumRawMetrics, type RawMetrics } from "@/lib/metrics";
import type { ReportRow } from "@/lib/types";

export async function listReports(orgId: string): Promise<ReportRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("org_id", orgId)
    .order("generated_at", { ascending: false });
  if (error) throw new Error(`Falha ao carregar relatórios: ${error.message}`);
  return (data ?? []) as unknown as ReportRow[];
}

export async function getReport(orgId: string, reportId: string): Promise<ReportRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", reportId)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar relatório: ${error.message}`);
  return data as unknown as ReportRow | null;
}

export type ReportInput = {
  client_id: string | null;
  type: "individual" | "consolidado";
  period_start: string;
  period_end: string;
  config: { analysis?: string; hideInternal?: boolean };
  generated_by: string;
};

export async function createReport(orgId: string, input: ReportInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({ org_id: orgId, ...input })
    .select("id")
    .single();
  if (error) throw new Error(`Falha ao criar relatório: ${error.message}`);
  return data.id as string;
}

export type ReportData = {
  clientNames: string[];
  received: number;
  pending: number;
  overdue: number;
  operationalCost: number;
  raw: RawMetrics;
  previous: { received: number; leads: number; roas: number | null };
};

function shiftPeriod(start: string, end: string): { start: string; end: string } {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const durationDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
  const prevEnd = new Date(startDate.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - (durationDays - 1) * 86400000);
  return { start: prevStart.toISOString().slice(0, 10), end: prevEnd.toISOString().slice(0, 10) };
}

export async function buildReportData(
  orgId: string,
  clientId: string | null,
  periodStart: string,
  periodEnd: string,
): Promise<ReportData> {
  const supabase = createAdminClient();

  let clientsQuery = supabase.from("clients").select("id, name").eq("org_id", orgId);
  if (clientId) clientsQuery = clientsQuery.eq("id", clientId);
  const { data: clients, error: clientsError } = await clientsQuery;
  if (clientsError) throw new Error(`Falha ao carregar clientes: ${clientsError.message}`);
  const clientIds = (clients ?? []).map((c) => c.id);

  async function fetchForPeriod(start: string, end: string) {
    if (clientIds.length === 0) {
      return { received: 0, pending: 0, overdue: 0, operationalCost: 0, raw: sumRawMetrics([]) };
    }
    const [chargesRes, costsRes, campaignsRes] = await Promise.all([
      supabase.from("charges").select("value_cents, paid_value_cents, due_date").in("client_id", clientIds).gte("due_date", start).lte("due_date", end),
      supabase.from("costs").select("value_cents").in("client_id", clientIds).gte("cost_date", start).lte("cost_date", end),
      supabase.from("campaigns").select("id").in("client_id", clientIds),
    ]);
    const charges = (chargesRes.data ?? []).map((c) => ({ ...c, id: "", org_id: "", client_id: "", contract_id: null, competencia: "", payment_method: null }));
    const summary = summarizeCharges(charges);
    const operationalCost = (costsRes.data ?? []).reduce((s, c) => s + c.value_cents, 0);

    const campaignIds = (campaignsRes.data ?? []).map((c) => c.id);
    let raw = sumRawMetrics([]);
    if (campaignIds.length > 0) {
      const { data: metrics } = await supabase
        .from("campaign_metrics")
        .select("*")
        .in("campaign_id", campaignIds)
        .gte("period", start)
        .lte("period", end);
      raw = sumRawMetrics(metrics ?? []);
    }

    return { received: summary.receivedCents, pending: summary.pendingCents, overdue: summary.overdueCents, operationalCost, raw };
  }

  const current = await fetchForPeriod(periodStart, periodEnd);
  const prevRange = shiftPeriod(periodStart, periodEnd);
  const previousData = await fetchForPeriod(prevRange.start, prevRange.end);
  const previousFormulas = computeFormulas(previousData.raw);

  return {
    clientNames: (clients ?? []).map((c) => c.name),
    received: current.received,
    pending: current.pending,
    overdue: current.overdue,
    operationalCost: current.operationalCost,
    raw: current.raw,
    previous: { received: previousData.received, leads: previousData.raw.leads, roas: previousFormulas.roas },
  };
}
