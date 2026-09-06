export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getClient } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-text-faint">{label}</dt>
      <dd className="mt-1 text-sm text-text">{value ?? <span className="text-text-faint">—</span>}</dd>
    </div>
  );
}

export default async function ClienteVisaoGeralPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const user = getCurrentUser();
  const client = await getClient(user.orgId, clientId);
  if (!client) notFound();

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Identificação</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Segmento" value={client.segment} />
          <Field label="Contato principal" value={client.primary_contact_name} />
          <Field label="Gestor responsável" value={client.responsible?.name} />
          <Field label="Plano / serviço contratado" value={client.plan_service} />
        </dl>

        <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-text-faint">Meta e plataforma</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Meta principal" value={client.goal} />
          <Field label="Plataforma utilizada" value={client.platform} />
          <Field label="Objetivo das campanhas" value={client.objective} />
          <Field label="Próxima ação" value={client.next_action} />
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Contrato</h3>
        <dl className="space-y-4">
          <Field label="Valor mensal" value={formatCurrency(client.monthly_contract_value_cents)} />
          <Field label="Data de entrada" value={client.entry_date && formatDate(client.entry_date)} />
          <Field label="Início do contrato" value={client.contract_start_date && formatDate(client.contract_start_date)} />
          <Field label="Vencimento" value={client.contract_due_date && formatDate(client.contract_due_date)} />
          <Field label="Renovação" value={client.renewal_date && formatDate(client.renewal_date)} />
        </dl>
      </Card>
    </div>
  );
}
