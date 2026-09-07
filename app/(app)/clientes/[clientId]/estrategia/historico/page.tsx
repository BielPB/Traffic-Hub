export const dynamic = "force-dynamic";

import Link from "next/link";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { listArchivedStrategies } from "@/lib/data/strategy";
import { getCurrentUser } from "@/lib/session";

export default async function EstrategiaHistoricoPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const user = getCurrentUser();
  const archived = await listArchivedStrategies(user.orgId, clientId);

  return (
    <>
      <PageHeader title="Histórico de estratégia" description="Versões arquivadas, mais recente primeiro." />
      {archived.length === 0 ? (
        <EmptyState icon={History} title="Nenhuma versão arquivada ainda" description="Versões anteriores aparecem aqui quando você salvar uma nova versão da estratégia atual." />
      ) : (
        <Card className="divide-y divide-border">
          {archived.map((s) => (
            <Link key={s.id} href={`/clientes/${clientId}/estrategia/historico/${s.id}`} className="flex items-center justify-between p-4 hover:bg-surface-alt">
              <span className="text-sm font-medium text-text">Versão {s.version_number}</span>
              <span className="text-xs text-text-faint">{formatDate(s.created_at)}</span>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
