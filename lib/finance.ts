import type { ChargeStatus } from "./labels";
import type { ChargeRow, ChargeWithStatus } from "./types";

/**
 * O status de uma cobrança nunca é lido de uma coluna gravada — depende da
 * data atual, então é sempre recalculado aqui a partir do lançamento real.
 * Ver blueprint: "todos os totais devem ser derivados dos lançamentos reais".
 */
export function deriveChargeStatus(
  valueCents: number,
  paidValueCents: number,
  dueDate: string,
  today: string = new Date().toISOString().slice(0, 10),
): ChargeStatus {
  if (paidValueCents >= valueCents) return "pago";
  if (paidValueCents > 0) return dueDate < today ? "vencido" : "parcial";
  return dueDate < today ? "vencido" : "pendente";
}

export function withChargeStatus(charge: ChargeRow): ChargeWithStatus {
  return {
    ...charge,
    status: deriveChargeStatus(charge.value_cents, charge.paid_value_cents, charge.due_date),
  };
}

export function summarizeCharges(charges: ChargeRow[]): {
  receivedCents: number;
  pendingCents: number;
  overdueCents: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  let receivedCents = 0;
  let pendingCents = 0;
  let overdueCents = 0;

  for (const charge of charges) {
    receivedCents += charge.paid_value_cents;
    const outstanding = charge.value_cents - charge.paid_value_cents;
    if (outstanding <= 0) continue;
    if (charge.due_date < today) overdueCents += outstanding;
    else pendingCents += outstanding;
  }

  return { receivedCents, pendingCents, overdueCents };
}

export type ClientFinancialSummary = {
  contractValueCents: number;
  operationalCostCentsCurrentMonth: number;
  mediaPlannedCents: number;
  mediaSpentCents: number;
  receivedCents: number;
  pendingCents: number;
  overdueCents: number;
  marginCents: number;
};

export function summarizeClientFinancials(params: {
  monthlyContractValueCents: number;
  charges: ChargeRow[];
  costsCurrentMonthCents: number;
  mediaBudgets: { planned_value_cents: number; spent_value_cents: number }[];
}): ClientFinancialSummary {
  const { monthlyContractValueCents, charges, costsCurrentMonthCents, mediaBudgets } = params;
  const { receivedCents, pendingCents, overdueCents } = summarizeCharges(charges);

  const mediaPlannedCents = mediaBudgets.reduce((sum, m) => sum + m.planned_value_cents, 0);
  const mediaSpentCents = mediaBudgets.reduce((sum, m) => sum + m.spent_value_cents, 0);

  return {
    contractValueCents: monthlyContractValueCents,
    operationalCostCentsCurrentMonth: costsCurrentMonthCents,
    mediaPlannedCents,
    mediaSpentCents,
    receivedCents,
    pendingCents,
    overdueCents,
    marginCents: monthlyContractValueCents - costsCurrentMonthCents,
  };
}

export function currentCompetencia(): string {
  return new Date().toISOString().slice(0, 7); // "AAAA-MM"
}
