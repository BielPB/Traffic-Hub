"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createReport } from "@/lib/data/reports";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  client_id: z.string().nullable(),
  period_start: z.string().min(1),
  period_end: z.string().min(1),
  analysis: z.string().nullable(),
  hideInternal: z.boolean(),
});

export async function createReportAction(formData: FormData) {
  const user = getCurrentUser();
  const clientId = (formData.get("client_id") as string) || null;
  const parsed = schema.safeParse({
    client_id: clientId,
    period_start: formData.get("period_start"),
    period_end: formData.get("period_end"),
    analysis: (formData.get("analysis") as string) || null,
    hideInternal: formData.get("hide_internal") === "on",
  });
  if (!parsed.success) redirect("/relatorios?erro=Preencha o período do relatório.");

  const reportId = await createReport(user.orgId, {
    client_id: parsed.data.client_id,
    type: parsed.data.client_id ? "individual" : "consolidado",
    period_start: parsed.data.period_start,
    period_end: parsed.data.period_end,
    config: { analysis: parsed.data.analysis ?? undefined, hideInternal: parsed.data.hideInternal },
    generated_by: user.id,
  });

  redirect(`/imprimir/relatorios/${reportId}`);
}
