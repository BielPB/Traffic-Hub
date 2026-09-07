import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  currency: string;
  date_format: string;
  timezone: string;
};

export async function getOrganization(orgId: string): Promise<OrganizationRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("organizations").select("*").eq("id", orgId).maybeSingle();
  if (error) throw new Error(`Falha ao carregar organização: ${error.message}`);
  return data;
}

export type OrganizationInput = {
  name: string;
  logo_url: string | null;
  currency: string;
  date_format: string;
  timezone: string;
};

export async function updateOrganization(orgId: string, input: OrganizationInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("organizations").update(input).eq("id", orgId);
  if (error) throw new Error(`Falha ao atualizar organização: ${error.message}`);
}
