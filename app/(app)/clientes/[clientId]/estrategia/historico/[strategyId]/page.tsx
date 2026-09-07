export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { sectionTitle } from "@/lib/strategy-sections";
import { getStrategyWithSections } from "@/lib/data/strategy";
import { getCurrentUser } from "@/lib/session";

export default async function EstrategiaVersaoPage({
  params,
}: {
  params: Promise<{ clientId: string; strategyId: string }>;
}) {
  const { strategyId } = await params;
  const user = getCurrentUser();
  const result = await getStrategyWithSections(user.orgId, strategyId);
  if (!result) notFound();
  const { strategy, sections } = result;

  return (
    <>
      <PageHeader title={`Versão ${strategy.version_number}`} description="Somente leitura — versão arquivada." />
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} className="p-5">
            <h3 className="mb-2 text-sm font-semibold text-text">{sectionTitle(section.section_type)}</h3>
            <p className="whitespace-pre-wrap text-sm text-text-muted">{section.content?.text || "—"}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
