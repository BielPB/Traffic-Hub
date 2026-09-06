export const dynamic = "force-dynamic";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { listCampaignsWithClient } from "@/lib/data/campaigns";
import { getCurrentUser } from "@/lib/session";

const STATUS_TONE = { planejada: "muted", ativa: "success", pausada: "warning", encerrada: "danger" } as const;
const STATUS_LABEL = { planejada: "Planejada", ativa: "Ativa", pausada: "Pausada", encerrada: "Encerrada" } as const;

export default async function CampanhasPage() {
  const user = getCurrentUser();
  const campaigns = await listCampaignsWithClient(user.orgId);

  return (
    <>
      <PageHeader
        title="Campanhas"
        description="Todas as campanhas da agência, por cliente e plataforma."
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhuma campanha cadastrada ainda"
          description="Campanhas são criadas dentro da aba Campanhas e métricas de cada cliente."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                <th className="px-4 py-3">Campanha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Plataforma</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Orçamento</th>
                <th className="px-4 py-3 text-right">Investido</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                  <td className="px-4 py-3">
                    {c.client ? (
                      <Link href={`/clientes/${c.client.id}/campanhas/${c.id}`} className="font-medium text-text hover:underline">
                        {c.name}
                      </Link>
                    ) : c.name}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{c.client?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-text-muted">{c.platform}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge></td>
                  <td className="px-4 py-3 text-right text-text-muted">{formatCurrency(c.budget_cents)}</td>
                  <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(c.spent_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
