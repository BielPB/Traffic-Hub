"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTask, updateTaskStatus } from "@/lib/data/tasks";
import { getCurrentUser } from "@/lib/session";

function back(clientId: string, error?: string) {
  const path = `/clientes/${clientId}/pendencias`;
  revalidatePath(path);
  revalidatePath("/pendencias");
  redirect(error ? `${path}?erro=${encodeURIComponent(error)}` : path);
}

const taskSchema = z.object({
  title: z.string().trim().min(1, "Informe o título da pendência."),
  description: z.string().nullable(),
  responsible_user_id: z.string().nullable(),
  priority: z.enum(["baixa", "media", "alta"]),
  due_date: z.string().nullable(),
});

export async function createClientTaskAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: (formData.get("description") as string) || null,
    responsible_user_id: (formData.get("responsible_user_id") as string) || null,
    priority: formData.get("priority") || "media",
    due_date: (formData.get("due_date") as string) || null,
  });
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message);

  try {
    await createTask(user.orgId, {
      client_id: clientId,
      related_entity_type: "client",
      related_entity_id: clientId,
      created_by: user.id,
      ...parsed.data,
    });
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao criar pendência.");
  }
  back(clientId);
}

export async function setTaskStatusAction(clientId: string, taskId: string, status: "pendente" | "em_andamento" | "concluida") {
  const user = getCurrentUser();
  try {
    await updateTaskStatus(user.orgId, taskId, status);
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao atualizar pendência.");
  }
  back(clientId);
}
