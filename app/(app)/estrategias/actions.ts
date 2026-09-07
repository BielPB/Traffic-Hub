"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createTemplate } from "@/lib/data/strategy";
import { getCurrentUser } from "@/lib/session";

export async function createBlankTemplateAction(formData: FormData) {
  const user = getCurrentUser();
  const name = (formData.get("name") as string)?.trim();
  if (name) await createTemplate(user.orgId, name);
  revalidatePath("/estrategias");
  redirect("/estrategias");
}
