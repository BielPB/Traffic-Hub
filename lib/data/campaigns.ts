import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CampaignMetricRow, CampaignRow, CampaignWithClient, MetricGoalRow } from "@/lib/types";

export async function listCampaigns(orgId: string, clientId?: string): Promise<CampaignRow[]> {
  const supabase = createAdminClient();
  let query = supabase.from("campaigns").select("*").eq("org_id", orgId);
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao carregar campanhas: ${error.message}`);
  return data ?? [];
}

export async function listCampaignsWithClient(orgId: string): Promise<CampaignWithClient[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, client:client_id(id, name)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao carregar campanhas: ${error.message}`);
  return (data ?? []) as unknown as CampaignWithClient[];
}

export async function getCampaign(orgId: string, campaignId: string): Promise<CampaignRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", campaignId)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar campanha: ${error.message}`);
  return data;
}

export type CampaignInput = {
  client_id: string;
  name: string;
  platform: string;
  objective: string | null;
  status: CampaignRow["status"];
  period_start: string | null;
  period_end: string | null;
  budget_cents: number;
  audience: string | null;
  offer: string | null;
  landing_page: string | null;
};

export async function createCampaign(orgId: string, input: CampaignInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ org_id: orgId, spent_cents: 0, ...input })
    .select("id")
    .single();
  if (error) throw new Error(`Falha ao criar campanha: ${error.message}`);
  return data.id as string;
}

export async function updateCampaignStatus(orgId: string, campaignId: string, status: CampaignRow["status"]): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("campaigns").update({ status }).eq("org_id", orgId).eq("id", campaignId);
  if (error) throw new Error(`Falha ao atualizar campanha: ${error.message}`);
}

export async function listCampaignMetricsForCampaigns(campaignIds: string[]): Promise<CampaignMetricRow[]> {
  if (campaignIds.length === 0) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("campaign_metrics").select("*").in("campaign_id", campaignIds);
  if (error) throw new Error(`Falha ao carregar métricas: ${error.message}`);
  return data ?? [];
}

export async function listCampaignMetrics(campaignId: string): Promise<CampaignMetricRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campaign_metrics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("period", { ascending: false });
  if (error) throw new Error(`Falha ao carregar métricas: ${error.message}`);
  return data ?? [];
}

export type CampaignMetricInput = Omit<CampaignMetricRow, "id" | "campaign_id">;

export async function upsertCampaignMetric(campaignId: string, input: CampaignMetricInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("campaign_metrics")
    .upsert({ campaign_id: campaignId, ...input }, { onConflict: "campaign_id,period" });
  if (error) throw new Error(`Falha ao lançar métricas: ${error.message}`);

  // mantém campaigns.spent_cents como soma dos lançamentos, para a tela de
  // Financeiro (verba de mídia) e a lista de campanhas ficarem coerentes.
  const { data: rows, error: sumError } = await supabase
    .from("campaign_metrics")
    .select("spent_cents")
    .eq("campaign_id", campaignId);
  if (sumError) throw new Error(`Falha ao recalcular investimento da campanha: ${sumError.message}`);
  const totalSpent = (rows ?? []).reduce((sum, r) => sum + r.spent_cents, 0);
  await supabase.from("campaigns").update({ spent_cents: totalSpent }).eq("id", campaignId);
}

export async function listMetricGoals(orgId: string, clientId: string): Promise<MetricGoalRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("metric_goals")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .order("metric_name");
  if (error) throw new Error(`Falha ao carregar metas: ${error.message}`);
  return data ?? [];
}

export type MetricGoalInput = {
  client_id: string;
  metric_name: string;
  target_value: number;
  period: string;
};

export async function createMetricGoal(orgId: string, input: MetricGoalInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("metric_goals").insert({ org_id: orgId, ...input });
  if (error) throw new Error(`Falha ao criar meta: ${error.message}`);
}
