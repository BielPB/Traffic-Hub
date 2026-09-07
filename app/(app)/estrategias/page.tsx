export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { listTemplates } from "@/lib/data/strategy";
import { listClients } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";
import { createBlankTemplateAction } from "./actions";

export default async function EstrategiasPage() {
  const user = getCurrentUser();
  const [templates, clients] = await Promise.all([listTemplates(user.orgId), listClients(user.orgId)]);

  return (
    <>
      <PageHeader title="Estratégias" description="Modelos reutilizáveis e acesso rápido à estratégia de cada cliente." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Modelos</h2>
          {templates.length === 0 ? (
            <EmptyState icon={BookOpenText} title="Nenhum modelo criado ainda" description="Crie um modelo em branco abaixo ou salve a estratégia de um cliente como modelo." />
          ) : (
            <Card className="mb-4 divide-y divide-border">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3.5">
                  <span className="text-sm font-medium text-text">{t.name}</span>
                  <span className="text-xs text-text-faint">{formatDate(t.created_at)}</span>
                </div>
              ))}
            </Card>
          )}
          <Card className="p-4">
            <form action={createBlankTemplateAction} className="flex gap-2">
              <input
                name="name"
                placeholder="Nome do novo modelo"
                required
                className="h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple"
              />
              <button type="submit" className="h-10 shrink-0 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
                Criar
              </button>
            </form>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Estratégia por cliente</h2>
          {clients.length === 0 ? (
            <EmptyState icon={BookOpenText} title="Nenhum cliente cadastrado" description="Cadastre um cliente para começar a documentar a estratégia dele." />
          ) : (
            <Card className="divide-y divide-border">
              {clients.map((c) => (
                <Link key={c.id} href={`/clientes/${c.id}/estrategia`} className="flex items-center justify-between p-3.5 hover:bg-surface-alt">
                  <span className="text-sm font-medium text-text">{c.name}</span>
                  <span className="text-xs text-text-faint">Ver estratégia →</span>
                </Link>
              ))}
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
