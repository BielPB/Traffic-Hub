"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createContract,
  createCharge,
  registerChargePayment,
  createCost,
  createMediaBudget,
} from "@/lib/data/financial";
import { centsFromInput } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

function back(clientId: string, error?: string) {
  const path = `/clientes/${clientId}/financeiro`;
  revalidatePath(path);
  revalidatePath("/financeiro");
  redirect(error ? `${path}?erro=${encodeURIComponent(error)}` : path);
}

const contractSchema = z.object({
  type: z.enum(["recorrente", "avulso"]),
  value_cents: z.number().int().min(1, "Informe o valor do contrato."),
  billing_day: z.number().int().min(1).max(28).nullable(),
  start_date: z.string().min(1, "Informe a data de início."),
  end_date: z.string().nullable(),
});

export async function createContractAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const billingDayRaw = formData.get("billing_day") as string;
  const parsed = contractSchema.safeParse({
    type: formData.get("type"),
    value_cents: centsFromInput(formData.get("value") as string),
    billing_day: billingDayRaw ? Number(billingDayRaw) : null,
    start_date: formData.get("start_date"),
    end_date: (formData.get("end_date") as string) || null,
  });
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message);

  try {
    await createContract(user.orgId, { client_id: clientId, ...parsed.data });
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao criar contrato.");
  }
  back(clientId);
}

const chargeSchema = z.object({
  contract_id: z.string().nullable(),
  competencia: z.string().regex(/^\d{4}-\d{2}$/, "Competência deve estar no formato AAAA-MM."),
  due_date: z.string().min(1, "Informe o vencimento."),
  value_cents: z.number().int().min(1, "Informe o valor da cobrança."),
});

export async function createChargeAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const parsed = chargeSchema.safeParse({
    contract_id: (formData.get("contract_id") as string) || null,
    competencia: formData.get("competencia"),
    due_date: formData.get("due_date"),
    value_cents: centsFromInput(formData.get("value") as string),
  });
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message);

  try {
    await createCharge(user.orgId, { client_id: clientId, ...parsed.data });
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao criar cobrança.");
  }
  back(clientId);
}

export async function registerPaymentAction(clientId: string, chargeId: string, formData: FormData) {
  const user = getCurrentUser();
  const paidValueCents = centsFromInput(formData.get("paid_value") as string);
  const paymentMethod = (formData.get("payment_method") as string) || null;
  if (paidValueCents <= 0) return back(clientId, "Informe um valor pago maior que zero.");

  try {
    await registerChargePayment(user.orgId, chargeId, paidValueCents, paymentMethod);
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao registrar pagamento.");
  }
  back(clientId);
}

const costSchema = z.object({
  category_id: z.string().nullable(),
  description: z.string().nullable(),
  type: z.enum(["interno", "externo"]),
  value_cents: z.number().int().min(1, "Informe o valor do custo."),
  competencia: z.string().regex(/^\d{4}-\d{2}$/, "Competência deve estar no formato AAAA-MM."),
  cost_date: z.string().min(1, "Informe a data do custo."),
});

export async function createCostAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const parsed = costSchema.safeParse({
    category_id: (formData.get("category_id") as string) || null,
    description: (formData.get("description") as string) || null,
    type: formData.get("type"),
    value_cents: centsFromInput(formData.get("value") as string),
    competencia: formData.get("competencia"),
    cost_date: formData.get("cost_date"),
  });
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message);

  try {
    await createCost(user.orgId, { client_id: clientId, ...parsed.data });
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao registrar custo.");
  }
  back(clientId);
}

const mediaBudgetSchema = z.object({
  platform: z.string().min(1, "Informe a plataforma."),
  competencia: z.string().regex(/^\d{4}-\d{2}$/, "Competência deve estar no formato AAAA-MM."),
  planned_value_cents: z.number().int().min(0),
  spent_value_cents: z.number().int().min(0),
});

export async function createMediaBudgetAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const parsed = mediaBudgetSchema.safeParse({
    platform: formData.get("platform"),
    competencia: formData.get("competencia"),
    planned_value_cents: centsFromInput(formData.get("planned_value") as string),
    spent_value_cents: centsFromInput(formData.get("spent_value") as string),
  });
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message);

  try {
    await createMediaBudget(user.orgId, { client_id: clientId, ...parsed.data });
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao registrar verba de mídia.");
  }
  back(clientId);
}
