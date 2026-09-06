export const dynamic = "force-dynamic";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { globalSearch } from "@/lib/data/search";
import { getCurrentUser } from "@/lib/session";

export default async function BuscaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const user = getCurrentUser();
  const results = await globalSearch(user.orgId, q);
  const total = results.clients.length + results.leads.length + results.campaigns.length;

  return (
    <>
      <PageHeader title="Busca" description={q ? `Resultados para "${q}"` : "Digite um termo na busca do topo para começar."} />

      {q && total === 0 && (
        <EmptyState icon={SearchX} title="Nada encontrado" description={`Nenhum cliente, lead ou campanha corresponde a "${q}".`} />
      )}

      <div className="space-y-6">
        {results.clients.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-faint">Clientes</h2>
            <Card className="divide-y divide-border">
              {results.clients.map((c) => (
                <Link key={c.id} href={`/clientes/${c.id}`} className="block p-3.5 hover:bg-surface-alt">
                  <p className="text-sm font-medium text-text">{c.name}</p>
                  {c.company && <p className="text-xs text-text-faint">{c.company}</p>}
                </Link>
              ))}
            </Card>
          </section>
        )}

        {results.leads.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-faint">Leads</h2>
            <Card className="divide-y divide-border">
              {results.leads.map((l) => (
                <Link key={l.id} href={`/prospeccao/${l.id}/editar`} className="block p-3.5 hover:bg-surface-alt">
                  <p className="text-sm font-medium text-text">{l.name}</p>
                  {l.company && <p className="text-xs text-text-faint">{l.company}</p>}
                </Link>
              ))}
            </Card>
          </section>
        )}

        {results.campaigns.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-faint">Campanhas</h2>
            <Card className="divide-y divide-border">
              {results.campaigns.map((c) => (
                <Link key={c.id} href={`/clientes/${c.client_id}/campanhas/${c.id}`} className="block p-3.5 hover:bg-surface-alt">
                  <p className="text-sm font-medium text-text">{c.name}</p>
                  {c.client_name && <p className="text-xs text-text-faint">{c.client_name}</p>}
                </Link>
              ))}
            </Card>
          </section>
        )}
      </div>
    </>
  );
}
