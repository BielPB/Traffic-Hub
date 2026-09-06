import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { KanbanStageRow, LeadRow, LeadWithRelations, LossReasonRow } from "@/lib/types";

const LEAD_SELECT = "*, responsible:responsible_id(id, name)";

export async function listKanbanStages(orgId: string): Promise<KanbanStageRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("kanban_stages")
    .select("*")
    .eq("org_id", orgId)
    .order("order");
  if (error) throw new Error(`Falha ao carregar etapas do kanban: ${error.message}`);
  return data ?? [];
}

export async function listLossReasons(orgId: string): Promise<LossReasonRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("loss_reasons").select("*").eq("org_id", orgId).order("name");
  if (error) throw new Error(`Falha ao carregar motivos de perda: ${error.message}`);
  return data ?? [];
}

export async function listLeads(orgId: string): Promise<LeadWithRelations[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("org_id", orgId)
    .is("converted_client_id", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao carregar leads: ${error.message}`);
  return (data ?? []) as unknown as LeadWithRelations[];
}

export async function getLead(orgId: string, leadId: string): Promise<LeadWithRelations | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("org_id", orgId)
    .eq("id", leadId)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar lead: ${error.message}`);
  return data as unknown as LeadWithRelations | null;
}

export type LeadInput = {
  name: string;
  company: string | null;
  niche: string | null;
  origin: string | null;
  service_of_interest: string | null;
  responsible_id: string | null;
  potential_value_cents: number;
  interest_level: LeadRow["interest_level"];
  next_action: string | null;
  next_contact_date: string | null;
  notes: string | null;
};

export async function createLead(orgId: string, stageId: string, input: LeadInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").insert({ org_id: orgId, stage_id: stageId, ...input });
  if (error) throw new Error(`Falha ao criar lead: ${error.message}`);
}

export async function updateLead(orgId: string, leadId: string, input: Partial<LeadInput>): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").update(input).eq("org_id", orgId).eq("id", leadId);
  if (error) throw new Error(`Falha ao atualizar lead: ${error.message}`);
}

export async function moveLeadStage(
  orgId: string,
  leadId: string,
  stageId: string,
  lostReasonId: string | null,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("leads")
    .update({ stage_id: stageId, lost_reason_id: lostReasonId })
    .eq("org_id", orgId)
    .eq("id", leadId);
  if (error) throw new Error(`Falha ao mover lead: ${error.message}`);
}

export async function convertLeadToClient(orgId: string, leadId: string): Promise<string> {
  const supabase = createAdminClient();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", leadId)
    .single();
  if (leadError) throw new Error(`Falha ao carregar lead: ${leadError.message}`);

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      org_id: orgId,
      name: lead.name,
      company: lead.company,
      segment: lead.niche,
      responsible_user_id: lead.responsible_id,
      plan_service: lead.service_of_interest,
      monthly_contract_value_cents: lead.potential_value_cents,
      entry_date: new Date().toISOString().slice(0, 10),
      status: "onboarding",
      health: "saudavel",
      next_action: "Iniciar onboarding",
    })
    .select("id")
    .single();
  if (clientError) throw new Error(`Falha ao converter lead em cliente: ${clientError.message}`);

  const { error: updateError } = await supabase
    .from("leads")
    .update({ converted_client_id: client.id })
    .eq("org_id", orgId)
    .eq("id", leadId);
  if (updateError) throw new Error(`Falha ao vincular lead ao cliente: ${updateError.message}`);

  return client.id as string;
}
