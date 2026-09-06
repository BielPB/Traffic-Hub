export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientTabs } from "@/components/clients/client-tabs";
import { CLIENT_HEALTH_LABELS, CLIENT_HEALTH_TONE, CLIENT_STATUS_LABELS, CLIENT_STATUS_TONE } from "@/lib/labels";
import { getClient } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const user = getCurrentUser();
  const client = await getClient(user.orgId, clientId);
  if (!client) notFound();

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-text md:text-2xl">{client.name}</h1>
            <Badge tone={CLIENT_STATUS_TONE[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
            <Badge tone={CLIENT_HEALTH_TONE[client.health]}>{CLIENT_HEALTH_LABELS[client.health]}</Badge>
          </div>
          {client.company && <p className="mt-1 text-sm text-text-muted">{client.company}</p>}
        </div>
        <Link
          href={`/clientes/${clientId}/editar`}
          className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium text-text-muted hover:bg-surface-hover"
        >
          <Pencil className="size-4" /> Editar cliente
        </Link>
      </div>

      <ClientTabs clientId={clientId} />

      {children}
    </>
  );
}
