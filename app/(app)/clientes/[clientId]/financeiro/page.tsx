export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CHARGE_STATUS_LABELS, CHARGE_STATUS_TONE, CONTRACT_TYPE_LABELS, COST_TYPE_LABELS } from "@/lib/labels";
import { formatCurrency, formatDate, centsToInputValue } from "@/lib/utils";
import { deriveChargeStatus, summarizeClientFinancials, currentCompetencia } from "@/lib/finance";
import { getClient } from "@/lib/data/clients";
import {
  listContracts,
  listCharges,
  listCostCategories,
  listCosts,
  sumCostsForCompetencia,
  listMediaBudgets,
} from "@/lib/data/financial";
import { getCurrentUser } from "@/lib/session";
import {
  createContractAction,
  createChargeAction,
  registerPaymentAction,
  createCostAction,
  createMediaBudgetAction,
} from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";
const addButtonClass =
  "h-10 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white";

export default async function ClienteFinanceiroPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { clientId } = await params;
  const { erro } = await searchParams;
  const user = getCurrentUser();

  const [client, contracts, charges, costCategories, costs, mediaBudgets, costsThisMonth] = await Promise.all([
    getClient(user.orgId, clientId),
    listContracts(user.orgId, clientId),
    listCharges(user.orgId, clientId),
    listCostCategories(user.orgId),
    listCosts(user.orgId, clientId),
    listMediaBudgets(user.orgId, clientId),
    sumCostsForCompetencia(user.orgId, clientId),
  ]);
  if (!client) notFound();

  const summary = summarizeClientFinancials({
    monthlyContractValueCents: client.monthly_contract_value_cents,
    charges,
    costsCurrentMonthCents: costsThisMonth,
    mediaBudgets,
  });
  const competencia = currentCompetencia();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      {erro && (
        <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{erro}</div>
      )}

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Contrato mensal" value={summary.contractValueCents} />
          <SummaryCard label={`Custo operacional (${competencia})`} value={summary.operationalCostCentsCurrentMonth} />
          <SummaryCard label="Margem estimada" value={summary.marginCents} highlight />
          <SummaryCard label="Verba de mídia (gasto/planejado)" value={summary.mediaSpentCents} secondary={summary.mediaPlannedCents} />
          <SummaryCard label="Recebido" value={summary.receivedCents} tone="success" />
          <SummaryCard label="Pendente" value={summary.pendingCents} tone="warning" />
          <SummaryCard label="Vencido" value={summary.overdueCents} tone="danger" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Contratos</h2>
        <Card className="overflow-x-auto p-5">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                <th className="pb-2">Tipo</th><th className="pb-2">Valor</th><th className="pb-2">Dia cobrança</th><th className="pb-2">Início</th><th className="pb-2">Fim</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-text-faint">Nenhum contrato cadastrado.</td></tr>
              )}
              {contracts.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="py-2.5">{CONTRACT_TYPE_LABELS[c.type]}</td>
                  <td className="py-2.5 font-medium">{formatCurrency(c.value_cents)}</td>
                  <td className="py-2.5">{c.billing_day ?? "—"}</td>
                  <td className="py-2.5">{formatDate(c.start_date)}</td>
                  <td className="py-2.5">{c.end_date ? formatDate(c.end_date) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form action={createContractAction.bind(null, clientId)} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-5">
            <div>
              <label className={labelClass}>Tipo</label>
              <select name="type" className={inputClass} defaultValue="recorrente">
                <option value="recorrente">Recorrente</option>
                <option value="avulso">Avulso</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input name="value" placeholder="1500,00" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Dia de cobrança</label>
              <input name="billing_day" type="number" min={1} max={28} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Início</label>
              <input name="start_date" type="date" defaultValue={today} className={inputClass} required />
            </div>
            <div className="flex items-end">
              <button type="submit" className={addButtonClass}>Adicionar contrato</button>
            </div>
          </form>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Cobranças</h2>
        <Card className="overflow-x-auto p-5">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                <th className="pb-2">Competência</th><th className="pb-2">Vencimento</th><th className="pb-2">Valor</th><th className="pb-2">Pago</th><th className="pb-2">Status</th><th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {charges.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-text-faint">Nenhuma cobrança lançada.</td></tr>
              )}
              {charges.map((charge) => {
                const status = deriveChargeStatus(charge.value_cents, charge.paid_value_cents, charge.due_date, today);
                return (
                  <tr key={charge.id} className="border-t border-border align-top">
                    <td className="py-2.5">{charge.competencia}</td>
                    <td className="py-2.5">{formatDate(charge.due_date)}</td>
                    <td className="py-2.5 font-medium">{formatCurrency(charge.value_cents)}</td>
                    <td className="py-2.5">{formatCurrency(charge.paid_value_cents)}</td>
                    <td className="py-2.5"><Badge tone={CHARGE_STATUS_TONE[status]}>{CHARGE_STATUS_LABELS[status]}</Badge></td>
                    <td className="py-2.5">
                      {status !== "pago" && (
                        <details>
                          <summary className="cursor-pointer text-xs font-medium text-purple-dark">Registrar pagamento</summary>
                          <form action={registerPaymentAction.bind(null, clientId, charge.id)} className="mt-2 flex flex-wrap gap-2">
                            <input
                              name="paid_value"
                              placeholder="Valor pago"
                              defaultValue={centsToInputValue(charge.value_cents - charge.paid_value_cents)}
                              className={`${inputClass} w-32`}
                            />
                            <input name="payment_method" placeholder="Forma de pagamento" className={`${inputClass} w-40`} />
                            <button type="submit" className="h-10 rounded-lg border border-border px-3 text-xs font-semibold text-text">
                              Confirmar
                            </button>
                          </form>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <form action={createChargeAction.bind(null, clientId)} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-5">
            <div>
              <label className={labelClass}>Contrato</label>
              <select name="contract_id" className={inputClass}>
                <option value="">Avulsa (sem contrato)</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>{CONTRACT_TYPE_LABELS[c.type]} — {formatCurrency(c.value_cents)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Competência (AAAA-MM)</label>
              <input name="competencia" defaultValue={competencia} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Vencimento</label>
              <input name="due_date" type="date" defaultValue={today} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input name="value" placeholder="1500,00" className={inputClass} required />
            </div>
            <div className="flex items-end">
              <button type="submit" className={addButtonClass}>Lançar cobrança</button>
            </div>
          </form>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Custos operacionais</h2>
        <Card className="overflow-x-auto p-5">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                <th className="pb-2">Competência</th><th className="pb-2">Descrição</th><th className="pb-2">Tipo</th><th className="pb-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {costs.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-text-faint">Nenhum custo registrado.</td></tr>
              )}
              {costs.map((cost) => (
                <tr key={cost.id} className="border-t border-border">
                  <td className="py-2.5">{cost.competencia}</td>
                  <td className="py-2.5">{cost.description ?? "—"}</td>
                  <td className="py-2.5">{COST_TYPE_LABELS[cost.type]}</td>
                  <td className="py-2.5 font-medium">{formatCurrency(cost.value_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form action={createCostAction.bind(null, clientId)} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-5">
            <div>
              <label className={labelClass}>Categoria</label>
              <select name="category_id" className={inputClass}>
                <option value="">Sem categoria</option>
                {costCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Descrição</label>
              <input name="description" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tipo</label>
              <select name="type" className={inputClass} defaultValue="interno">
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input name="value" placeholder="500,00" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Competência</label>
              <input name="competencia" defaultValue={competencia} className={inputClass} required />
            </div>
            <input type="hidden" name="cost_date" value={today} />
            <div className="flex items-end sm:col-start-5">
              <button type="submit" className={addButtonClass}>Adicionar custo</button>
            </div>
          </form>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Verba de mídia</h2>
        <p className="mb-3 -mt-2 text-xs text-text-faint">Sempre separada do contrato da agência — é o dinheiro que vai para as plataformas de anúncio.</p>
        <Card className="overflow-x-auto p-5">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
                <th className="pb-2">Competência</th><th className="pb-2">Plataforma</th><th className="pb-2">Planejado</th><th className="pb-2">Gasto</th>
              </tr>
            </thead>
            <tbody>
              {mediaBudgets.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-text-faint">Nenhuma verba de mídia registrada.</td></tr>
              )}
              {mediaBudgets.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="py-2.5">{m.competencia}</td>
                  <td className="py-2.5">{m.platform}</td>
                  <td className="py-2.5">{formatCurrency(m.planned_value_cents)}</td>
                  <td className="py-2.5 font-medium">{formatCurrency(m.spent_value_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form action={createMediaBudgetAction.bind(null, clientId)} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-5">
            <div>
              <label className={labelClass}>Plataforma</label>
              <input name="platform" placeholder="Meta Ads" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Competência</label>
              <input name="competencia" defaultValue={competencia} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Planejado (R$)</label>
              <input name="planned_value" placeholder="2000,00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gasto (R$)</label>
              <input name="spent_value" placeholder="1800,00" className={inputClass} />
            </div>
            <div className="flex items-end">
              <button type="submit" className={addButtonClass}>Registrar</button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  secondary,
  tone,
  highlight,
}: {
  label: string;
  value: number;
  secondary?: number;
  tone?: "success" | "warning" | "danger";
  highlight?: boolean;
}) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : "text-text";
  return (
    <Card className={`p-4 ${highlight ? "border-purple/40" : ""}`}>
      <p className="text-xs font-medium text-text-faint">{label}</p>
      <p className={`mt-1.5 text-lg font-semibold ${toneClass}`}>
        {formatCurrency(value)}
        {secondary !== undefined && <span className="text-sm font-normal text-text-faint"> / {formatCurrency(secondary)}</span>}
      </p>
    </Card>
  );
}
