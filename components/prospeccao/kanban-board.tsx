"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { moveLeadStageAction } from "@/app/(app)/prospeccao/actions";
import type { KanbanStageRow, LeadWithRelations, LossReasonRow } from "@/lib/types";

const INTEREST_TONE = { baixo: "muted", medio: "warning", alto: "success" } as const;
const INTEREST_LABEL = { baixo: "Baixo interesse", medio: "Médio interesse", alto: "Alto interesse" } as const;

export function KanbanBoard({
  stages,
  initialLeads,
  lossReasons,
}: {
  stages: KanbanStageRow[];
  initialLeads: LeadWithRelations[];
  lossReasons: LossReasonRow[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [pendingLoss, setPendingLoss] = useState<{ leadId: string; stageId: string } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  function applyMove(leadId: string, stageId: string, lostReasonId: string | null) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage_id: stageId, lost_reason_id: lostReasonId } : l)));
    void moveLeadStageAction(leadId, stageId, lostReasonId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const stageId = over.id as string;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage_id === stageId) return;

    const targetStage = stages.find((s) => s.id === stageId);
    if (targetStage?.name === "Perdido") {
      setPendingLoss({ leadId, stageId });
      return;
    }
    applyMove(leadId, stageId, null);
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage_id === stage.id);
            const total = stageLeads.reduce((sum, l) => sum + l.potential_value_cents, 0);
            return (
              <Column key={stage.id} id={stage.id}>
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-text">{stage.name}</h3>
                  <span className="text-xs text-text-faint">{stageLeads.length}</span>
                </div>
                {stageLeads.length > 0 && (
                  <p className="mb-2 px-1 text-xs text-text-faint">{formatCurrency(total)} em potencial</p>
                )}
                <div className="flex flex-col gap-2.5">
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              </Column>
            );
          })}
        </div>
      </DndContext>

      {pendingLoss && (
        <LossReasonModal
          lossReasons={lossReasons}
          onCancel={() => setPendingLoss(null)}
          onConfirm={(reasonId) => {
            applyMove(pendingLoss.leadId, pendingLoss.stageId, reasonId);
            setPendingLoss(null);
          }}
        />
      )}
    </>
  );
}

function Column({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 rounded-xl border p-3 transition-colors ${
        isOver ? "border-purple bg-purple/5" : "border-border bg-surface-alt"
      }`}
    >
      {children}
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadWithRelations }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`touch-none rounded-lg border border-border bg-surface p-3 shadow-sm ${isDragging ? "opacity-60" : ""}`}
    >
      <Link href={`/prospeccao/${lead.id}/editar`} className="mb-1.5 block text-sm font-semibold text-text hover:underline">
        {lead.name}
      </Link>
      {lead.company && <p className="mb-2 text-xs text-text-faint">{lead.company}</p>}
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Badge tone={INTEREST_TONE[lead.interest_level]}>{INTEREST_LABEL[lead.interest_level]}</Badge>
        {lead.niche && <Badge tone="muted">{lead.niche}</Badge>}
      </div>
      <dl className="space-y-1 text-xs text-text-muted">
        {lead.potential_value_cents > 0 && (
          <div className="flex justify-between"><dt>Potencial</dt><dd className="font-medium text-text">{formatCurrency(lead.potential_value_cents)}</dd></div>
        )}
        {lead.responsible && <div className="flex justify-between"><dt>Responsável</dt><dd>{lead.responsible.name}</dd></div>}
        {lead.next_action && <div className="truncate"><dt className="inline text-text-faint">Próxima ação: </dt><dd className="inline">{lead.next_action}</dd></div>}
      </dl>
    </div>
  );
}

function LossReasonModal({
  lossReasons,
  onCancel,
  onConfirm,
}: {
  lossReasons: LossReasonRow[];
  onCancel: () => void;
  onConfirm: (reasonId: string | null) => void;
}) {
  const [reasonId, setReasonId] = useState<string>(lossReasons[0]?.id ?? "");
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-1 text-sm font-semibold text-text">Motivo da perda</h3>
        <p className="mb-4 text-xs text-text-faint">Registre por que este lead não avançou.</p>
        <select
          value={reasonId}
          onChange={(e) => setReasonId(e.target.value)}
          className="mb-4 h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text"
        >
          {lossReasons.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="h-9 rounded-lg border border-border px-3 text-sm text-text-muted">Cancelar</button>
          <button
            onClick={() => onConfirm(reasonId || null)}
            className="h-9 rounded-lg bg-gradient-to-r from-purple to-blue px-3 text-sm font-semibold text-white"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
