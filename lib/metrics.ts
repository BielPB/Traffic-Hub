// Fórmulas de performance — sempre calculadas a partir dos números brutos
// informados (impressões, cliques, leads, conversões, investimento, receita),
// nunca gravadas em coluna. Retornam null quando o denominador é zero, para a
// UI mostrar "—" em vez de Infinity/NaN.

export type RawMetrics = {
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  appointments: number;
  shows: number;
  sales: number;
  spent_cents: number;
  attributed_revenue_cents: number;
};

function safeDiv(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return numerator / denominator;
}

export function computeFormulas(m: RawMetrics) {
  return {
    ctr: safeDiv(m.clicks, m.impressions), // fração; UI multiplica por 100
    frequency: safeDiv(m.impressions, m.reach),
    cpcCents: safeDiv(m.spent_cents, m.clicks),
    cpmCents: (() => {
      const v = safeDiv(m.spent_cents, m.impressions);
      return v === null ? null : v * 1000;
    })(),
    cplCents: safeDiv(m.spent_cents, m.leads),
    conversionRate: safeDiv(m.conversions, m.leads),
    cpaCents: safeDiv(m.spent_cents, m.conversions),
    roas: safeDiv(m.attributed_revenue_cents, m.spent_cents),
  };
}

export function sumRawMetrics(rows: RawMetrics[]): RawMetrics {
  return rows.reduce<RawMetrics>(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      reach: acc.reach + r.reach,
      clicks: acc.clicks + r.clicks,
      leads: acc.leads + r.leads,
      conversions: acc.conversions + r.conversions,
      appointments: acc.appointments + r.appointments,
      shows: acc.shows + r.shows,
      sales: acc.sales + r.sales,
      spent_cents: acc.spent_cents + r.spent_cents,
      attributed_revenue_cents: acc.attributed_revenue_cents + r.attributed_revenue_cents,
    }),
    { impressions: 0, reach: 0, clicks: 0, leads: 0, conversions: 0, appointments: 0, shows: 0, sales: 0, spent_cents: 0, attributed_revenue_cents: 0 },
  );
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatRatio(value: number | null, digits = 2): string {
  if (value === null) return "—";
  return value.toFixed(digits);
}
