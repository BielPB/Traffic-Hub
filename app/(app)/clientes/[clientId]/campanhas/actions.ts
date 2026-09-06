"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCampaign, upsertCampaignMetric, updateCampaignStatus, createMetricGoal } from "@/lib/data/campaigns";
import { centsFromInput } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

function back(clientId: string, error?: string, path = `/clientes/${clientId}/campanhas`) {
  revalidatePath(path);
  revalidatePath("/campanhas");
  revalidatePath("/metricas");
  redirect(error ? `${path}?erro=${encodeURIComponent(error)}` : path);
}

const campaignSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da campanha."),
  platform: z.string().trim().min(1, "Informe a plataforma."),
  objective: z.string().nullable(),
  status: z.enum(["planejada", "ativa", "pausada", "encerrada"]),
  period_start: z.string().nullable(),
  period_end: z.string().nullable(),
  budget_cents: z.number().int().min(0),
  audience: z.string().nullable(),
  offer: z.string().nullable(),
  landing_page: z.string().nullable(),
});

export async function createCampaignAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const emptyToNull = (v: FormDataEntryValue | null) => ((v as string | null)?.trim() ? (v as string) : null);
  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    platform: formData.get("platform"),
    objective: emptyToNull(formData.get("objective")),
    status: formData.get("status") || "planejada",
    period_start: emptyToNull(formData.get("period_start")),
    period_end: emptyToNull(formData.get("period_end")),
    budget_cents: centsFromInput(formData.get("budget") as string),
    audience: emptyToNull(formData.get("audience")),
    offer: emptyToNull(formData.get("offer")),
    landing_page: emptyToNull(formData.get("landing_page")),
  });
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message);

  try {
    await createCampaign(user.orgId, { client_id: clientId, ...parsed.data });
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao criar campanha.");
  }
  back(clientId);
}

export async function setCampaignStatusAction(clientId: string, campaignId: string, status: "planejada" | "ativa" | "pausada" | "encerrada") {
  const user = getCurrentUser();
  await updateCampaignStatus(user.orgId, campaignId, status);
  back(clientId, undefined, `/clientes/${clientId}/campanhas/${campaignId}`);
}

const metricSchema = z.object({
  period: z.string().min(1, "Informe o período (AAAA-MM-DD)."),
  impressions: z.number().int().min(0),
  reach: z.number().int().min(0),
  clicks: z.number().int().min(0),
  leads: z.number().int().min(0),
  conversions: z.number().int().min(0),
  appointments: z.number().int().min(0),
  shows: z.number().int().min(0),
  sales: z.number().int().min(0),
  spent_cents: z.number().int().min(0),
  attributed_revenue_cents: z.number().int().min(0),
});

function numberFrom(formData: FormData, key: string): number {
  const raw = formData.get(key) as string;
  const n = Number.parseInt(raw || "0", 10);
  return Number.isNaN(n) ? 0 : n;
}

export async function upsertCampaignMetricAction(clientId: string, campaignId: string, formData: FormData) {
  const parsed = metricSchema.safeParse({
    period: formData.get("period"),
    impressions: numberFrom(formData, "impressions"),
    reach: numberFrom(formData, "reach"),
    clicks: numberFrom(formData, "clicks"),
    leads: numberFrom(formData, "leads"),
    conversions: numberFrom(formData, "conversions"),
    appointments: numberFrom(formData, "appointments"),
    shows: numberFrom(formData, "shows"),
    sales: numberFrom(formData, "sales"),
    spent_cents: centsFromInput(formData.get("spent") as string),
    attributed_revenue_cents: centsFromInput(formData.get("attributed_revenue") as string),
  });
  const path = `/clientes/${clientId}/campanhas/${campaignId}`;
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message, path);

  try {
    await upsertCampaignMetric(campaignId, parsed.data);
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao lançar métricas.", path);
  }
  back(clientId, undefined, path);
}

const goalSchema = z.object({
  metric_name: z.string().min(1),
  target_value: z.number().min(0),
  period: z.string().min(1),
});

export async function createMetricGoalAction(clientId: string, formData: FormData) {
  const user = getCurrentUser();
  const parsed = goalSchema.safeParse({
    metric_name: formData.get("metric_name"),
    target_value: Number.parseFloat((formData.get("target_value") as string)?.replace(",", ".") || "0"),
    period: formData.get("period"),
  });
  if (!parsed.success) return back(clientId, parsed.error.issues[0]?.message);

  try {
    await createMetricGoal(user.orgId, { client_id: clientId, ...parsed.data });
  } catch (err) {
    return back(clientId, err instanceof Error ? err.message : "Falha ao criar meta.");
  }
  back(clientId);
}
