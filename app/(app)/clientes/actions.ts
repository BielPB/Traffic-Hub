"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient as createClientRecord, updateClient, type ClientInput } from "@/lib/data/clients";
import { centsFromInput } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

const emptyToNull = (v: FormDataEntryValue | null) => {
  const s = (v as string | null)?.trim();
  return s ? s : null;
};

const clientSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cliente."),
  company: z.string().nullable(),
  segment: z.string().nullable(),
  primary_contact_name: z.string().nullable(),
  responsible_user_id: z.string().nullable(),
  status: z.enum(["onboarding", "planejamento", "ativo", "atencao", "pausado", "encerrado"]),
  health: z.enum(["saudavel", "atencao", "critico"]),
  plan_service: z.string().nullable(),
  monthly_contract_value_cents: z.number().int().min(0),
  entry_date: z.string().nullable(),
  contract_start_date: z.string().nullable(),
  contract_due_date: z.string().nullable(),
  renewal_date: z.string().nullable(),
  goal: z.string().nullable(),
  platform: z.string().nullable(),
  objective: z.string().nullable(),
  next_action: z.string().nullable(),
});

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    name: formData.get("name") ?? "",
    company: emptyToNull(formData.get("company")),
    segment: emptyToNull(formData.get("segment")),
    primary_contact_name: emptyToNull(formData.get("primary_contact_name")),
    responsible_user_id: emptyToNull(formData.get("responsible_user_id")),
    status: formData.get("status") || "onboarding",
    health: formData.get("health") || "saudavel",
    plan_service: emptyToNull(formData.get("plan_service")),
    monthly_contract_value_cents: centsFromInput(formData.get("monthly_contract_value") as string),
    entry_date: emptyToNull(formData.get("entry_date")),
    contract_start_date: emptyToNull(formData.get("contract_start_date")),
    contract_due_date: emptyToNull(formData.get("contract_due_date")),
    renewal_date: emptyToNull(formData.get("renewal_date")),
    goal: emptyToNull(formData.get("goal")),
    platform: emptyToNull(formData.get("platform")),
    objective: emptyToNull(formData.get("objective")),
    next_action: emptyToNull(formData.get("next_action")),
  });
}

export type ClientFormState = { error?: string };

export async function createClientAction(_prev: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = getCurrentUser();
  let clientId: string;
  try {
    clientId = await createClientRecord(user.orgId, parsed.data as ClientInput);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao criar cliente." };
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${clientId}`);
}

export async function updateClientAction(
  clientId: string,
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = getCurrentUser();
  try {
    await updateClient(user.orgId, clientId, parsed.data as ClientInput);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Falha ao atualizar cliente." };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clientId}`);
  redirect(`/clientes/${clientId}`);
}
