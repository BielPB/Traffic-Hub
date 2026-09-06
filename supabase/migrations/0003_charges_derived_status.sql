-- O status de uma cobrança (pendente/parcial/pago/vencido) depende da data
-- atual, não só do último lançamento — guardar como coluna ficaria
-- desatualizado sozinho quando o vencimento passa sem nenhuma escrita nova.
-- A partir de agora ele é sempre derivado em consulta a partir de
-- value_cents, paid_value_cents e due_date (ver lib/finance.ts).

alter table charges drop column if exists status;
drop type if exists charge_status;
