import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TaskRow, TaskWithRelations } from "@/lib/types";

const TASK_SELECT = "*, responsible:responsible_user_id(id, name), client:client_id(id, name)";

export async function listTasks(
  orgId: string,
  filters?: { clientId?: string; responsibleUserId?: string },
): Promise<TaskWithRelations[]> {
  const supabase = createAdminClient();
  let query = supabase.from("tasks").select(TASK_SELECT).eq("org_id", orgId);
  if (filters?.clientId) query = query.eq("client_id", filters.clientId);
  if (filters?.responsibleUserId) query = query.eq("responsible_user_id", filters.responsibleUserId);
  const { data, error } = await query.order("due_date", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Falha ao carregar pendências: ${error.message}`);
  return (data ?? []) as unknown as TaskWithRelations[];
}

export type TaskInput = {
  client_id: string | null;
  related_entity_type: TaskRow["related_entity_type"];
  related_entity_id: string | null;
  title: string;
  description: string | null;
  responsible_user_id: string | null;
  priority: TaskRow["priority"];
  due_date: string | null;
  created_by: string;
};

export async function createTask(orgId: string, input: TaskInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("tasks").insert({ org_id: orgId, status: "pendente", ...input });
  if (error) throw new Error(`Falha ao criar pendência: ${error.message}`);
}

export async function updateTaskStatus(
  orgId: string,
  taskId: string,
  status: TaskRow["status"],
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("org_id", orgId).eq("id", taskId);
  if (error) throw new Error(`Falha ao atualizar pendência: ${error.message}`);
}
