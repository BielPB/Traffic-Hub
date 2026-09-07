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

export async function listAllOrgUsers(orgId: string): Promise<UserRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, org_id, name, email, role, status")
    .eq("org_id", orgId)
    .order("name");

  if (error) throw new Error(`Falha ao carregar usuários: ${error.message}`);
  return data ?? [];
}

export type UserInput = { name: string; email: string; role: string };

export async function createOrgUser(orgId: string, input: UserInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("users").insert({ org_id: orgId, status: "ativo", ...input });
  if (error) throw new Error(`Falha ao criar usuário: ${error.message}`);
}

export async function updateUserRole(orgId: string, userId: string, role: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("users").update({ role }).eq("org_id", orgId).eq("id", userId);
  if (error) throw new Error(`Falha ao atualizar papel: ${error.message}`);
}

export async function toggleUserStatus(orgId: string, userId: string, status: "ativo" | "inativo"): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("users").update({ status }).eq("org_id", orgId).eq("id", userId);
  if (error) throw new Error(`Falha ao atualizar status: ${error.message}`);
}
