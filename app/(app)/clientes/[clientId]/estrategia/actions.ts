"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  updateSectionContent,
  deleteSection,
  addSection,
  reorderSections,
  createNewVersion,
  saveCurrentAsTemplate,
  applyTemplateToClient,
} from "@/lib/data/strategy";
import { getCurrentUser } from "@/lib/session";

function back(clientId: string) {
  const path = `/clientes/${clientId}/estrategia`;
  revalidatePath(path);
  redirect(path);
}

export async function updateSectionAction(clientId: string, sectionId: string, formData: FormData) {
  const text = (formData.get("text") as string) ?? "";
  await updateSectionContent(sectionId, text);
  back(clientId);
}

export async function deleteSectionAction(clientId: string, sectionId: string) {
  await deleteSection(sectionId);
  back(clientId);
}

export async function addSectionAction(clientId: string, strategyId: string, order: number, formData: FormData) {
  const sectionType = formData.get("section_type") as string;
  if (sectionType) await addSection(strategyId, sectionType, order);
  back(clientId);
}

export async function moveSectionAction(clientId: string, orderedIds: string[]) {
  await reorderSections(orderedIds);
  back(clientId);
}

export async function createNewVersionAction(clientId: string) {
  const user = getCurrentUser();
  await createNewVersion(user.orgId, clientId, user.id);
  back(clientId);
}

export async function saveAsTemplateAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const name = (formData.get("name") as string)?.trim();
  if (name) await saveCurrentAsTemplate(user.orgId, clientId, user.id, name);
  back(clientId);
}

export async function applyTemplateAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const templateId = formData.get("template_id") as string;
  if (templateId) await applyTemplateToClient(user.orgId, clientId, templateId, user.id);
  back(clientId);
}
