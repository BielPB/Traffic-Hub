import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Alert = {
  id: string;
  label: string;
  href: string;
  severity: "warning" | "danger";
};

export async function listAlerts(orgId: string): Promise<Alert[]> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [chargesRes, tasksRes, clientsRes] = await Promise.all([
    supabase.from("charges").select("id, value_cents, paid_value_cents, due_date").eq("org_id", orgId).lt("due_date", today),
    supabase.from("tasks").select("id, due_date").eq("org_id", orgId).neq("status", "concluida").lt("due_date", today),
    supabase.from("clients").select("id, contract_due_date").eq("org_id", orgId).gte("contract_due_date", today).lte("contract_due_date", in7days),
  ]);

  const alerts: Alert[] = [];

  const overdueCharges = (chargesRes.data ?? []).filter((c) => c.value_cents > c.paid_value_cents);
  if (overdueCharges.length > 0) {
    alerts.push({
      id: "charges-overdue",
      label: `${overdueCharges.length} cobrança${overdueCharges.length > 1 ? "s" : ""} vencida${overdueCharges.length > 1 ? "s" : ""}`,
      href: "/financeiro?status=vencido",
      severity: "danger",
    });
  }

  const overdueTasks = tasksRes.data ?? [];
  if (overdueTasks.length > 0) {
    alerts.push({
      id: "tasks-overdue",
      label: `${overdueTasks.length} pendência${overdueTasks.length > 1 ? "s" : ""} vencida${overdueTasks.length > 1 ? "s" : ""}`,
      href: "/pendencias",
      severity: "danger",
    });
  }

  const dueClients = clientsRes.data ?? [];
  if (dueClients.length > 0) {
    alerts.push({
      id: "contracts-due",
      label: `${dueClients.length} contrato${dueClients.length > 1 ? "s" : ""} vencendo em 7 dias`,
      href: "/clientes",
      severity: "warning",
    });
  }

  return alerts;
}
