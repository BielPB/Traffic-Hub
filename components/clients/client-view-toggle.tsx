"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CLIENT_HEALTH_LABELS, CLIENT_HEALTH_TONE, CLIENT_STATUS_LABELS, CLIENT_STATUS_TONE } from "@/lib/labels";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { ClientWithResponsible } from "@/lib/types";

export function ClientViewToggle({ clients }: { clients: ClientWithResponsible[] }) {
  const [view, setView] = useState<"cards" | "lista">("cards");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-lg border border-border bg-surface-alt p-1">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium",
              view === "cards" ? "bg-surface text-text shadow-sm" : "text-text-faint",
            )}
          >
            <LayoutGrid className="size-4" /> Cards
          </button>
          <button
            type="button"
            onClick={() => setView("lista")}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium",
              view === "lista" ? "bg-surface text-text shadow-sm" : "text-text-faint",
            )}
          >
            <List className="size-4" /> Lista
          </button>
        </div>
      </div>

      {view === "cards" ? <CardsView clients={clients} /> : <TableView clients={clients} />}
    </div>
  );
}

function CardsView({ clients }: { clients: ClientWithResponsible[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {clients.map((c) => (
        <Link key={c.id} href={`/clientes/${c.id}`}>
          <Card className="h-full p-5 transition-colors hover:border-border-strong">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">{c.name}</p>
                {c.company && <p className="truncate text-sm text-text-faint">{c.company}</p>}
              </div>
              <Badge tone={CLIENT_HEALTH_TONE[c.health]}>{CLIENT_HEALTH_LABELS[c.health]}</Badge>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone={CLIENT_STATUS_TONE[c.status]}>{CLIENT_STATUS_LABELS[c.status]}</Badge>
              {c.responsible && <Badge tone="muted">{c.responsible.name}</Badge>}
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-faint">Contrato mensal</dt>
                <dd className="font-medium text-text">{formatCurrency(c.monthly_contract_value_cents)}</dd>
              </div>
              {c.contract_due_date && (
                <div className="flex justify-between">
                  <dt className="text-text-faint">Vencimento</dt>
                  <dd className="text-text">{formatDate(c.contract_due_date)}</dd>
                </div>
              )}
              {c.next_action && (
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-text-faint">Próxima ação</dt>
                  <dd className="truncate text-right text-text">{c.next_action}</dd>
                </div>
              )}
            </dl>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function TableView({ clients }: { clients: ClientWithResponsible[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Responsável</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Saúde</th>
            <th className="px-4 py-3 text-right">Contrato mensal</th>
            <th className="px-4 py-3">Próxima ação</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
              <td className="px-4 py-3">
                <Link href={`/clientes/${c.id}`} className="font-medium text-text hover:underline">
                  {c.name}
                </Link>
                {c.company && <p className="text-xs text-text-faint">{c.company}</p>}
              </td>
              <td className="px-4 py-3 text-text-muted">{c.responsible?.name ?? "—"}</td>
              <td className="px-4 py-3"><Badge tone={CLIENT_STATUS_TONE[c.status]}>{CLIENT_STATUS_LABELS[c.status]}</Badge></td>
              <td className="px-4 py-3"><Badge tone={CLIENT_HEALTH_TONE[c.health]}>{CLIENT_HEALTH_LABELS[c.health]}</Badge></td>
              <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(c.monthly_contract_value_cents)}</td>
              <td className="px-4 py-3 text-text-muted">{c.next_action ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
