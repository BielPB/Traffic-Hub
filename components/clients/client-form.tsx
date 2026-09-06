"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CLIENT_HEALTH_LABELS, CLIENT_STATUS_LABELS } from "@/lib/labels";
import { centsToInputValue } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { ClientFormState } from "@/app/(app)/clientes/actions";
import type { ClientWithResponsible } from "@/lib/types";
import type { UserRow } from "@/lib/types";

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

export function ClientForm({
  action,
  users,
  defaultValues,
  submitLabel,
}: {
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  users: UserRow[];
  defaultValues?: ClientWithResponsible;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Identificação</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="name">Nome do cliente *</label>
            <input id="name" name="name" required defaultValue={defaultValues?.name} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="company">Empresa</label>
            <input id="company" name="company" defaultValue={defaultValues?.company ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="segment">Segmento</label>
            <input id="segment" name="segment" defaultValue={defaultValues?.segment ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="primary_contact_name">Contato principal</label>
            <input
              id="primary_contact_name"
              name="primary_contact_name"
              defaultValue={defaultValues?.primary_contact_name ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="responsible_user_id">Gestor responsável</label>
            <select
              id="responsible_user_id"
              name="responsible_user_id"
              defaultValue={defaultValues?.responsible_user_id ?? ""}
              className={inputClass}
            >
              <option value="">Sem responsável definido</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="plan_service">Plano / serviço contratado</label>
            <input id="plan_service" name="plan_service" defaultValue={defaultValues?.plan_service ?? ""} className={inputClass} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Status e saúde</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="status">Status operacional</label>
            <select id="status" name="status" defaultValue={defaultValues?.status ?? "onboarding"} className={inputClass}>
              {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="health">Saúde do cliente</label>
            <select id="health" name="health" defaultValue={defaultValues?.health ?? "saudavel"} className={inputClass}>
              {Object.entries(CLIENT_HEALTH_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Contrato</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="monthly_contract_value">Valor mensal do contrato (R$)</label>
            <input
              id="monthly_contract_value"
              name="monthly_contract_value"
              placeholder="1500,00"
              defaultValue={defaultValues ? centsToInputValue(defaultValues.monthly_contract_value_cents) : ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="entry_date">Data de entrada</label>
            <input type="date" id="entry_date" name="entry_date" defaultValue={defaultValues?.entry_date ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="contract_start_date">Início do contrato</label>
            <input type="date" id="contract_start_date" name="contract_start_date" defaultValue={defaultValues?.contract_start_date ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="contract_due_date">Vencimento do contrato</label>
            <input type="date" id="contract_due_date" name="contract_due_date" defaultValue={defaultValues?.contract_due_date ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="renewal_date">Renovação</label>
            <input type="date" id="renewal_date" name="renewal_date" defaultValue={defaultValues?.renewal_date ?? ""} className={inputClass} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">Meta e plataforma</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="goal">Meta principal</label>
            <input id="goal" name="goal" defaultValue={defaultValues?.goal ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="platform">Plataforma utilizada</label>
            <input id="platform" name="platform" placeholder="Meta Ads, Google Ads..." defaultValue={defaultValues?.platform ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="objective">Objetivo das campanhas</label>
            <input id="objective" name="objective" defaultValue={defaultValues?.objective ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="next_action">Próxima ação</label>
            <input id="next_action" name="next_action" defaultValue={defaultValues?.next_action ?? ""} className={inputClass} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
