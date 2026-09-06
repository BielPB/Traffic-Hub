"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLead, updateLead, moveLeadStage, convertLeadToClient } from "@/lib/data/leads";
import { centsFromInput } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do lead."),
  company: z.string().nullable(),
  niche: z.string().nullable(),
  origin: z.string().nullable(),
  service_of_interest: z.string().nullable(),
  responsible_id: z.string().nullable(),
  potential_value_cents: z.number().int().min(0),
  interest_level: z.enum(["baixo", "medio", "alto"]),
  next_action: z.string().nullable(),
  next_contact_date: z.string().nullable(),
  notes: z.string().nullable(),
});

function parseLeadForm(formData: FormData) {
  const emptyToNull = (v: FormDataEntryValue | null) => {
    const s = (v as string | null)?.trim();
    return s ? s : null;
  };
  return leadSchema.safeParse({
    name: formData.get("name") ?? "",
    company: emptyToNull(formData.get("company")),
    niche: emptyToNull(formData.get("niche")),
    origin: emptyToNull(formData.get("origin")),
    service_of_interest: emptyToNull(formData.get("service_of_interest")),
    responsible_id: emptyToNull(formData.get("responsible_id")),
    potential_value_cents: centsFromInput(formData.get("potential_value") as string),
    interest_level: formData.get("interest_level") || "medio",
    next_action: emptyToNull(formData.get("next_action")),
    next_contact_date: emptyToNull(formData.get("next_contact_date")),
    notes: emptyToNull(formData.get("notes")),
  });
}

export type LeadFormState = { error?: string };

export async function createLeadAction(stageId: string, _prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const parsed = parseLeadForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const user = getCurrentUser();
  try {
    await createLead(user.orgId, stageId, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao criar lead." };
  }
  revalidatePath("/prospeccao");
  redirect("/prospeccao");
}

export async function updateLeadAction(leadId: string, _prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const parsed = parseLeadForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const user = getCurrentUser();
  try {
    await updateLead(user.orgId, leadId, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao atualizar lead." };
  }
  revalidatePath("/prospeccao");
  redirect("/prospeccao");
}

export async function moveLeadStageAction(leadId: string, stageId: string, lostReasonId: string | null) {
  const user = getCurrentUser();
  await moveLeadStage(user.orgId, leadId, stageId, lostReasonId);
  revalidatePath("/prospeccao");
}

export async function convertLeadAction(leadId: string) {
  const user = getCurrentUser();
  const clientId = await convertLeadToClient(user.orgId, leadId);
  revalidatePath("/prospeccao");
  revalidatePath("/clientes");
  redirect(`/clientes/${clientId}`);
}
