export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUp, ArrowDown, Trash2, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { formatDate } from "@/lib/utils";
import { SECTION_DEFINITIONS, sectionTitle } from "@/lib/strategy-sections";
import { getOrCreateCurrentStrategy, listArchivedStrategies, listTemplates } from "@/lib/data/strategy";
import { getCurrentUser } from "@/lib/session";
import {
  updateSectionAction,
  deleteSectionAction,
  addSectionAction,
  moveSectionAction,
  createNewVersionAction,
  saveAsTemplateAction,
  applyTemplateAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";

export default async function ClienteEstrategiaPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const user = getCurrentUser();
  const [{ strategy, sections }, archived, templates] = await Promise.all([
    getOrCreateCurrentStrategy(user.orgId, clientId, user.id),
    listArchivedStrategies(user.orgId, clientId),
    listTemplates(user.orgId),
  ]);

  const usedTypes = new Set(sections.map((s) => s.section_type));
  const missingTypes = SECTION_DEFINITIONS.filter((s) => !usedTypes.has(s.type));
  const orderedIds = sections.map((s) => s.id);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <Badge tone="purple">Versão atual · v{strategy.version_number}</Badge>
          <span className="text-xs text-text-faint">Criada em {formatDate(strategy.created_at)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/clientes/${clientId}/estrategia/historico`}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-hover"
          >
            <History className="size-3.5" /> Histórico ({archived.length})
          </Link>
          <form action={createNewVersionAction.bind(null, clientId)}>
            <ConfirmButton
              message="Isso arquiva a versão atual e cria uma nova a partir dela. Continuar?"
              className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-hover"
            >
              Salvar nova versão
            </ConfirmButton>
          </form>
        </div>
      </Card>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id} className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-text">{sectionTitle(section.section_type)}</h3>
              <div className="flex gap-1">
                {index > 0 && (
                  <form action={moveSectionAction.bind(null, clientId, swap(orderedIds, index, index - 1))}>
                    <button type="submit" aria-label="Mover para cima" className="flex size-8 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover">
                      <ArrowUp className="size-4" />
                    </button>
                  </form>
                )}
                {index < sections.length - 1 && (
                  <form action={moveSectionAction.bind(null, clientId, swap(orderedIds, index, index + 1))}>
                    <button type="submit" aria-label="Mover para baixo" className="flex size-8 items-center justify-center rounded-md text-text-faint hover:bg-surface-hover">
                      <ArrowDown className="size-4" />
                    </button>
                  </form>
                )}
                <form action={deleteSectionAction.bind(null, clientId, section.id)}>
                  <ConfirmButton message="Remover este bloco da estratégia atual?" className="flex size-8 items-center justify-center rounded-md text-text-faint hover:bg-danger-bg hover:text-danger">
                    <Trash2 className="size-4" />
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <form action={updateSectionAction.bind(null, clientId, section.id)} className="space-y-2">
              <textarea
                name="text"
                rows={4}
                defaultValue={section.content?.text ?? ""}
                placeholder={SECTION_DEFINITIONS.find((s) => s.type === section.section_type)?.placeholder}
                className={`${inputClass} h-auto py-2.5`}
              />
              <div className="flex justify-end">
                <button type="submit" className="h-9 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-xs font-semibold text-white">
                  Salvar bloco
                </button>
              </div>
            </form>
          </Card>
        ))}
      </div>

      {missingTypes.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Adicionar bloco</h3>
          <form action={addSectionAction.bind(null, clientId, strategy.id, sections.length)} className="flex flex-wrap gap-2">
            <select name="section_type" className={`${inputClass} max-w-xs`}>
              {missingTypes.map((s) => <option key={s.type} value={s.type}>{s.title}</option>)}
            </select>
            <button type="submit" className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-surface-hover">
              Adicionar
            </button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Salvar como modelo</h3>
          <form action={saveAsTemplateAction.bind(null, clientId)} className="flex gap-2">
            <input name="name" placeholder="Nome do modelo" className={inputClass} required />
            <button type="submit" className="h-10 shrink-0 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-surface-hover">
              Salvar
            </button>
          </form>
        </Card>

        {templates.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Aplicar modelo</h3>
            <form action={applyTemplateAction.bind(null, clientId)} className="flex gap-2">
              <select name="template_id" className={inputClass}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ConfirmButton
                message="Isso arquiva a versão atual e cria uma nova a partir do modelo selecionado. Continuar?"
                className="h-10 shrink-0 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-surface-hover"
              >
                Aplicar
              </ConfirmButton>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

function swap(ids: string[], i: number, j: number): string[] {
  const copy = [...ids];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}
