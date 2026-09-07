"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateOrganization } from "@/lib/data/organizations";
import {
  createKanbanStage,
  deleteKanbanStage,
  reorderKanbanStages,
  createLossReason,
  deleteLossReason,
} from "@/lib/data/leads";
import { createCostCategory, deleteCostCategory } from "@/lib/data/financial";
import { getCurrentUser } from "@/lib/session";

function back() {
  revalidatePath("/configuracoes");
  redirect("/configuracoes");
}

export async function updateOrganizationAction(formData: FormData) {
  const user = getCurrentUser();
  await updateOrganization(user.orgId, {
    name: (formData.get("name") as string)?.trim(),
    logo_url: (formData.get("logo_url") as string) || null,
    currency: (formData.get("currency") as string) || "BRL",
    date_format: (formData.get("date_format") as string) || "DD/MM/YYYY",
    timezone: (formData.get("timezone") as string) || "America/Sao_Paulo",
  });
  back();
}

export async function createKanbanStageAction(order: number, formData: FormData) {
  const user = getCurrentUser();
  const name = (formData.get("name") as string)?.trim();
  if (name) await createKanbanStage(user.orgId, name, order);
  back();
}

export async function deleteKanbanStageAction(stageId: string) {
  const user = getCurrentUser();
  await deleteKanbanStage(user.orgId, stageId);
  back();
}

export async function moveKanbanStageAction(orderedIds: string[]) {
  await reorderKanbanStages(orderedIds);
  back();
}

export async function createLossReasonAction(formData: FormData) {
  const user = getCurrentUser();
  const name = (formData.get("name") as string)?.trim();
  if (name) await createLossReason(user.orgId, name);
  back();
}

export async function deleteLossReasonAction(reasonId: string) {
  const user = getCurrentUser();
  await deleteLossReason(user.orgId, reasonId);
  back();
}

export async function createCostCategoryAction(formData: FormData) {
  const user = getCurrentUser();
  const name = (formData.get("name") as string)?.trim();
  if (name) await createCostCategory(user.orgId, name);
  back();
}

export async function deleteCostCategoryAction(categoryId: string) {
  const user = getCurrentUser();
  await deleteCostCategory(user.orgId, categoryId);
  back();
}
