import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentCompetencia } from "@/lib/finance";
import type { ChargeRow, ContractRow, CostCategoryRow, CostRow, MediaBudgetRow } from "@/lib/types";

// ---------------------------------------------------------------------------
// contratos
// ---------------------------------------------------------------------------
export async function listContracts(orgId: string, clientId: string): Promise<ContractRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .order("start_date", { ascending: false });
  if (error) throw new Error(`Falha ao carregar contratos: ${error.message}`);
  return data ?? [];
}

export type ContractInput = {
  client_id: string;
  type: ContractRow["type"];
  value_cents: number;
  billing_day: number | null;
  start_date: string;
  end_date: string | null;
};

export async function createContract(orgId: string, input: ContractInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("contracts").insert({ org_id: orgId, ...input });
  if (error) throw new Error(`Falha ao criar contrato: ${error.message}`);
}

// ---------------------------------------------------------------------------
// cobranças
// ---------------------------------------------------------------------------
export async function listCharges(orgId: string, clientId?: string): Promise<ChargeRow[]> {
  const supabase = createAdminClient();
  let query = supabase.from("charges").select("*").eq("org_id", orgId);
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query.order("due_date", { ascending: true });
  if (error) throw new Error(`Falha ao carregar cobranças: ${error.message}`);
  return data ?? [];
}

export type ChargeWithClient = ChargeRow & { client: { id: string; name: string } | null };

export async function listChargesWithClient(orgId: string): Promise<ChargeWithClient[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("charges")
    .select("*, client:client_id(id, name)")
    .eq("org_id", orgId)
    .order("due_date", { ascending: true });
  if (error) throw new Error(`Falha ao carregar cobranças: ${error.message}`);
  return (data ?? []) as unknown as ChargeWithClient[];
}

export type ChargeInput = {
  client_id: string;
  contract_id: string | null;
  competencia: string;
  due_date: string;
  value_cents: number;
};

export async function createCharge(orgId: string, input: ChargeInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("charges").insert({ org_id: orgId, paid_value_cents: 0, ...input });
  if (error) throw new Error(`Falha ao criar cobrança: ${error.message}`);
}

export async function registerChargePayment(
  orgId: string,
  chargeId: string,
  paidValueCents: number,
  paymentMethod: string | null,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("charges")
    .update({ paid_value_cents: paidValueCents, payment_method: paymentMethod, paid_at: new Date().toISOString() })
    .eq("org_id", orgId)
    .eq("id", chargeId);
  if (error) throw new Error(`Falha ao registrar pagamento: ${error.message}`);
}

// ---------------------------------------------------------------------------
// custos operacionais
// ---------------------------------------------------------------------------
export async function listCostCategories(orgId: string): Promise<CostCategoryRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("cost_categories").select("*").eq("org_id", orgId).order("name");
  if (error) throw new Error(`Falha ao carregar categorias de custo: ${error.message}`);
  return data ?? [];
}

export async function listCosts(orgId: string, clientId: string): Promise<CostRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .order("cost_date", { ascending: false });
  if (error) throw new Error(`Falha ao carregar custos: ${error.message}`);
  return data ?? [];
}

export async function sumCostsForCompetencia(
  orgId: string,
  clientId: string,
  competencia: string = currentCompetencia(),
): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("costs")
    .select("value_cents")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .eq("competencia", competencia);
  if (error) throw new Error(`Falha ao somar custos: ${error.message}`);
  return (data ?? []).reduce((sum, row) => sum + row.value_cents, 0);
}

export type CostInput = {
  client_id: string;
  category_id: string | null;
  description: string | null;
  type: CostRow["type"];
  value_cents: number;
  competencia: string;
  cost_date: string;
};

export async function createCost(orgId: string, input: CostInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("costs").insert({ org_id: orgId, ...input });
  if (error) throw new Error(`Falha ao criar custo: ${error.message}`);
}

// ---------------------------------------------------------------------------
// verba de mídia
// ---------------------------------------------------------------------------
export async function listMediaBudgets(orgId: string, clientId: string): Promise<MediaBudgetRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_budgets")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .order("competencia", { ascending: false });
  if (error) throw new Error(`Falha ao carregar verba de mídia: ${error.message}`);
  return data ?? [];
}

export type MediaBudgetInput = {
  client_id: string;
  platform: string;
  competencia: string;
  planned_value_cents: number;
  spent_value_cents: number;
};

export async function createMediaBudget(orgId: string, input: MediaBudgetInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("media_budgets").insert({ org_id: orgId, ...input });
  if (error) throw new Error(`Falha ao registrar verba de mídia: ${error.message}`);
}
