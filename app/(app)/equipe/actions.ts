"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrgUser, updateUserRole, toggleUserStatus } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";

function back() {
  revalidatePath("/equipe");
  redirect("/equipe");
}

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("E-mail inválido."),
  role: z.enum(["administrador", "coordenador", "gestor_trafego", "comercial", "financeiro", "visualizador"]),
});

export async function createUserAction(formData: FormData) {
  const user = getCurrentUser();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role") || "visualizador",
  });
  if (!parsed.success) redirect(`/equipe?erro=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);

  await createOrgUser(user.orgId, parsed.data);
  back();
}

export async function updateUserRoleAction(userId: string, formData: FormData) {
  const user = getCurrentUser();
  const role = formData.get("role") as string;
  await updateUserRole(user.orgId, userId, role);
  back();
}

export async function toggleUserStatusAction(userId: string, nextStatus: "ativo" | "inativo") {
  const user = getCurrentUser();
  await toggleUserStatus(user.orgId, userId, nextStatus);
  back();
}
