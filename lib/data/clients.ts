import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ClientRow, ClientWithResponsible } from "@/lib/types";

const CLIENT_SELECT = "*, responsible:responsible_user_id(id, name)";

export async function listClients(orgId: string): Promise<ClientWithResponsible[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao carregar clientes: ${error.message}`);
  return (data ?? []) as unknown as ClientWithResponsible[];
}

export async function getClient(orgId: string, clientId: string): Promise<ClientWithResponsible | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("org_id", orgId)
    .eq("id", clientId)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar cliente: ${error.message}`);
  return data as unknown as ClientWithResponsible | null;
}

export type ClientInput = {
  name: string;
  company: string | null;
  segment: string | null;
  primary_contact_name: string | null;
  responsible_user_id: string | null;
  status: ClientRow["status"];
  health: ClientRow["health"];
  plan_service: string | null;
  monthly_contract_value_cents: number;
  entry_date: string | null;
  contract_start_date: string | null;
  contract_due_date: string | null;
  renewal_date: string | null;
  goal: string | null;
  platform: string | null;
  objective: string | null;
  next_action: string | null;
};

export async function createClient(orgId: string, input: ClientInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ org_id: orgId, ...input })
    .select("id")
    .single();

  if (error) throw new Error(`Falha ao criar cliente: ${error.message}`);
  return data.id as string;
}

export async function updateClient(orgId: string, clientId: string, input: Partial<ClientInput>): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("clients")
    .update(input)
    .eq("org_id", orgId)
    .eq("id", clientId);

  if (error) throw new Error(`Falha ao atualizar cliente: ${error.message}`);
}
