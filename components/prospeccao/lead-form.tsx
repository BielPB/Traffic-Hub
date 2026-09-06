"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { centsToInputValue } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LeadFormState } from "@/app/(app)/prospeccao/actions";
import type { LeadWithRelations, UserRow } from "@/lib/types";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1.5 block text-sm font-medium text-text-muted";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-purple to-blue px-5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Salvando..." : label}
    </button>
  );
}

export function LeadForm({
  action,
  users,
  defaultValues,
  submitLabel,
}: {
  action: (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;
  users: UserRow[];
  defaultValues?: LeadWithRelations;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{state.error}</div>
      )}

      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="name">Nome do lead *</label>
            <input id="name" name="name" required defaultValue={defaultValues?.name} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="company">Empresa</label>
            <input id="company" name="company" defaultValue={defaultValues?.company ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="niche">Nicho</label>
            <input id="niche" name="niche" defaultValue={defaultValues?.niche ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="origin">Origem</label>
            <input id="origin" name="origin" placeholder="Indicação, Instagram..." defaultValue={defaultValues?.origin ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="service_of_interest">Serviço de interesse</label>
            <input id="service_of_interest" name="service_of_interest" defaultValue={defaultValues?.service_of_interest ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="responsible_id">Responsável</label>
            <select id="responsible_id" name="responsible_id" defaultValue={defaultValues?.responsible_id ?? ""} className={inputClass}>
              <option value="">Sem responsável</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="potential_value">Valor potencial (R$)</label>
            <input
              id="potential_value"
              name="potential_value"
              placeholder="2000,00"
              defaultValue={defaultValues ? centsToInputValue(defaultValues.potential_value_cents) : ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="interest_level">Nível de interesse</label>
            <select id="interest_level" name="interest_level" defaultValue={defaultValues?.interest_level ?? "medio"} className={inputClass}>
              <option value="baixo">Baixo</option>
              <option value="medio">Médio</option>
              <option value="alto">Alto</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="next_contact_date">Próximo contato</label>
            <input type="date" id="next_contact_date" name="next_contact_date" defaultValue={defaultValues?.next_contact_date ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="next_action">Próxima ação</label>
            <input id="next_action" name="next_action" defaultValue={defaultValues?.next_action ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="notes">Observações</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ""} className={inputClass} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
