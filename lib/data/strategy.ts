import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { SECTION_DEFINITIONS } from "@/lib/strategy-sections";
import type { StrategyRow, StrategySectionRow, StrategyTemplateRow } from "@/lib/types";

type SectionSeed = { section_type: string; order: number; content: { text?: string } };

function defaultSectionSeeds(): SectionSeed[] {
  return SECTION_DEFINITIONS.map((s, i) => ({ section_type: s.type, order: i, content: {} }));
}

async function insertSections(strategyId: string, seeds: SectionSeed[]) {
  const supabase = createAdminClient();
  if (seeds.length === 0) return;
  const { error } = await supabase
    .from("strategy_sections")
    .insert(seeds.map((s) => ({ strategy_id: strategyId, ...s })));
  if (error) throw new Error(`Falha ao criar seções da estratégia: ${error.message}`);
}

export async function getOrCreateCurrentStrategy(
  orgId: string,
  clientId: string,
  userId: string,
): Promise<{ strategy: StrategyRow; sections: StrategySectionRow[] }> {
  const supabase = createAdminClient();
  const { data: existing, error } = await supabase
    .from("strategies")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .eq("status", "atual")
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar estratégia: ${error.message}`);

  let strategy = existing as StrategyRow | null;
  if (!strategy) {
    const { data: created, error: createError } = await supabase
      .from("strategies")
      .insert({ org_id: orgId, client_id: clientId, version_number: 1, status: "atual", created_by: userId })
      .select("*")
      .single();
    if (createError) throw new Error(`Falha ao criar estratégia: ${createError.message}`);
    strategy = created as StrategyRow;
    await insertSections(strategy.id, defaultSectionSeeds());
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("strategy_sections")
    .select("*")
    .eq("strategy_id", strategy.id)
    .order("order");
  if (sectionsError) throw new Error(`Falha ao carregar seções: ${sectionsError.message}`);

  return { strategy, sections: (sections ?? []) as StrategySectionRow[] };
}

export async function listArchivedStrategies(orgId: string, clientId: string): Promise<StrategyRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("strategies")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .eq("status", "arquivada")
    .order("version_number", { ascending: false });
  if (error) throw new Error(`Falha ao carregar histórico: ${error.message}`);
  return data ?? [];
}

export async function getStrategyWithSections(
  orgId: string,
  strategyId: string,
): Promise<{ strategy: StrategyRow; sections: StrategySectionRow[] } | null> {
  const supabase = createAdminClient();
  const { data: strategy, error } = await supabase
    .from("strategies")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", strategyId)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar estratégia: ${error.message}`);
  if (!strategy) return null;

  const { data: sections, error: sectionsError } = await supabase
    .from("strategy_sections")
    .select("*")
    .eq("strategy_id", strategyId)
    .order("order");
  if (sectionsError) throw new Error(`Falha ao carregar seções: ${sectionsError.message}`);

  return { strategy, sections: (sections ?? []) as StrategySectionRow[] };
}

export async function updateSectionContent(sectionId: string, text: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("strategy_sections").update({ content: { text } }).eq("id", sectionId);
  if (error) throw new Error(`Falha ao salvar seção: ${error.message}`);
}

export async function deleteSection(sectionId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("strategy_sections").delete().eq("id", sectionId);
  if (error) throw new Error(`Falha ao remover seção: ${error.message}`);
}

export async function addSection(strategyId: string, sectionType: string, order: number): Promise<void> {
  await insertSections(strategyId, [{ section_type: sectionType, order, content: {} }]);
}

export async function reorderSections(orderedSectionIds: string[]): Promise<void> {
  const supabase = createAdminClient();
  await Promise.all(
    orderedSectionIds.map((id, index) => supabase.from("strategy_sections").update({ order: index }).eq("id", id)),
  );
}

async function archiveAndVersion(
  orgId: string,
  clientId: string,
  userId: string,
  seeds: SectionSeed[],
): Promise<string> {
  const supabase = createAdminClient();
  const { data: current } = await supabase
    .from("strategies")
    .select("*")
    .eq("org_id", orgId)
    .eq("client_id", clientId)
    .eq("status", "atual")
    .maybeSingle();

  if (current) {
    const { error: archiveError } = await supabase.from("strategies").update({ status: "arquivada" }).eq("id", current.id);
    if (archiveError) throw new Error(`Falha ao arquivar versão anterior: ${archiveError.message}`);
  }

  const nextVersion = (current?.version_number ?? 0) + 1;
  const { data: created, error: createError } = await supabase
    .from("strategies")
    .insert({ org_id: orgId, client_id: clientId, version_number: nextVersion, status: "atual", created_by: userId })
    .select("id")
    .single();
  if (createError) throw new Error(`Falha ao criar nova versão: ${createError.message}`);

  await insertSections(created.id, seeds);
  return created.id as string;
}

export async function createNewVersion(orgId: string, clientId: string, userId: string): Promise<string> {
  const { sections } = await getOrCreateCurrentStrategy(orgId, clientId, userId);
  const seeds: SectionSeed[] = sections.map((s) => ({ section_type: s.section_type, order: s.order, content: s.content }));
  return archiveAndVersion(orgId, clientId, userId, seeds);
}

export async function listTemplates(orgId: string): Promise<StrategyTemplateRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("strategy_templates")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao carregar modelos: ${error.message}`);
  return (data ?? []) as unknown as StrategyTemplateRow[];
}

export async function createTemplate(
  orgId: string,
  name: string,
  sections: SectionSeed[] = defaultSectionSeeds(),
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("strategy_templates").insert({ org_id: orgId, name, sections });
  if (error) throw new Error(`Falha ao criar modelo: ${error.message}`);
}

export async function saveCurrentAsTemplate(orgId: string, clientId: string, userId: string, name: string): Promise<void> {
  const { sections } = await getOrCreateCurrentStrategy(orgId, clientId, userId);
  const seeds: SectionSeed[] = sections.map((s) => ({ section_type: s.section_type, order: s.order, content: s.content }));
  await createTemplate(orgId, name, seeds);
}

export async function applyTemplateToClient(orgId: string, clientId: string, templateId: string, userId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: template, error } = await supabase
    .from("strategy_templates")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", templateId)
    .single();
  if (error) throw new Error(`Falha ao carregar modelo: ${error.message}`);

  const seeds: SectionSeed[] = (template.sections as SectionSeed[]).map((s) => ({
    section_type: s.section_type,
    order: s.order,
    content: s.content ?? {},
  }));
  await archiveAndVersion(orgId, clientId, userId, seeds);
}
