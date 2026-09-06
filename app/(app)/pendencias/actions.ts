"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTask, updateTaskStatus } from "@/lib/data/tasks";
import { getCurrentUser } from "@/lib/session";

function back(error?: string) {
  revalidatePath("/pendencias");
  redirect(error ? `/pendencias?erro=${encodeURIComponent(error)}` : "/pendencias");
}

const taskSchema = z.object({
  title: z.string().trim().min(1, "Informe o título da pendência."),
  client_id: z.string().nullable(),
  responsible_user_id: z.string().nullable(),
  priority: z.enum(["baixa", "media", "alta"]),
  due_date: z.string().nullable(),
});

export async function createTaskAction(formData: FormData) {
  const user = getCurrentUser();
  const clientId = (formData.get("client_id") as string) || null;
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    client_id: clientId,
    responsible_user_id: (formData.get("responsible_user_id") as string) || null,
    priority: formData.get("priority") || "media",
    due_date: (formData.get("due_date") as string) || null,
  });
  if (!parsed.success) return back(parsed.error.issues[0]?.message);

  const { client_id, ...rest } = parsed.data;
  try {
    await createTask(user.orgId, {
      client_id,
      related_entity_type: "client",
      related_entity_id: client_id,
      description: null,
      created_by: user.id,
      ...rest,
    });
  } catch (err) {
    return back(err instanceof Error ? err.message : "Falha ao criar pendência.");
  }
  back();
}

export async function setTaskStatusAction(taskId: string, status: "pendente" | "em_andamento" | "concluida") {
  const user = getCurrentUser();
  try {
    await updateTaskStatus(user.orgId, taskId, status);
  } catch (err) {
    return back(err instanceof Error ? err.message : "Falha ao atualizar pendência.");
  }
  back();
}
