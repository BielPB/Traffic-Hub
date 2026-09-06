import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRow } from "@/lib/types";

export async function listOrgUsers(orgId: string): Promise<UserRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, org_id, name, email, role, status")
    .eq("org_id", orgId)
    .eq("status", "ativo")
    .order("name");

  if (error) throw new Error(`Falha ao carregar usuários: ${error.message}`);
  return data ?? [];
}
