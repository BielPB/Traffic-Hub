export const dynamic = "force-dynamic";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_TONE, type ChargeStatus } from "@/lib/labels";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { deriveChargeStatus, summarizeCharges } from "@/lib/finance";
import { listChargesWithClient } from "@/lib/data/financial";
import { listClients } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";

const STATUS_FILTERS: { value: ChargeStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "parcial", label: "Parciais" },
  { value: "pago", label: "Pagas" },
  { value: "vencido", label: "Vencidas" },
];

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cliente?: string }>;
}) {
  const { status = "todos", cliente = "todos" } = await searchParams;
  const user = getCurrentUser();
  const [charges, clients] = await Promise.all([listChargesWithClient(user.orgId), listClients(user.orgId)]);

  const today = new Date().toISOString().slice(0, 10);
  const withStatus = charges.map((c) => ({ ...c, computedStatus: deriveChargeStatus(c.value_cents, c.paid_value_cents, c.due_date, today) }));
  const filtered = withStatus.filter((c) => {
    if (status !== "todos" && c.computedStatus !== status) return false;
    if (cliente !== "todos" && c.client_id !== cliente) return false;
    return true;
  });
  const summary = summarizeCharges(charges);

  function filterHref(next: Partial<{ status: string; cliente: string }>) {
    const params = new URLSearchParams({ status, cliente, ...next });
    return `/financeiro?${params.toString()}`;
  }

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Contratos, cobranças e custos consolidados — contrato, custo operacional e verba de mídia sempre separados."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-text-faint">Recebido</p>
          <p className="mt-1.5 text-lg font-semibold text-success">{formatCurrency(summary.receivedCents)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-text-faint">Pendente</p>
          <p className="mt-1.5 text-lg font-semibold text-warning">{formatCurrency(summary.pendingCents)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-text-faint">Vencido</p>
          <p className="mt-1.5 text-lg font-semibold text-danger">{formatCurrency(summary.overdueCents)}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={filterHref({ status: f.value })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                status === f.value ? "border-purple bg-purple/10 text-purple-dark" : "border-border text-text-faint hover:bg-surface-hover",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form className="ml-auto flex items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <select
            name="cliente"
            defaultValue={cliente}
            className="h-9 rounded-lg border border-border bg-surface-alt px-3 text-sm text-text"
          >
            <option value="todos">Todos os clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-hover">
            Filtrar
          </button>
        </form>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhuma cobrança encontrada" description="Ajuste os filtros ou lance cobranças na página de cada cliente." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Competência</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Pago</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                  <td className="px-4 py-3">
                    {c.client ? (
                      <Link href={`/clientes/${c.client.id}/financeiro`} className="font-medium text-text hover:underline">
                        {c.client.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{c.competencia}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(c.due_date)}</td>
                  <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(c.value_cents)}</td>
                  <td className="px-4 py-3 text-right text-text-muted">{formatCurrency(c.paid_value_cents)}</td>
                  <td className="px-4 py-3"><Badge tone={CHARGE_STATUS_TONE[c.computedStatus]}>{CHARGE_STATUS_LABELS[c.computedStatus]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
