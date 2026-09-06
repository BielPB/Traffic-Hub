-- Dados de demonstração — organização e usuário semente usados por
-- lib/session.ts enquanto não há tela de login. Fácil de remover: apague a
-- organização (cascade cuida do resto) antes de ligar a uma agência real.

insert into organizations (id, name, slug, currency, timezone)
values ('00000000-0000-0000-0000-00000000000a', 'Traffic Hub Demo', 'traffic-hub-demo', 'BRL', 'America/Sao_Paulo')
on conflict (id) do nothing;

insert into users (id, org_id, name, email, role, status)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-00000000000a',
  'Ana Beatriz',
  'ana@trafficdemo.com',
  'administrador',
  'ativo'
)
on conflict (id) do nothing;

insert into kanban_stages (org_id, name, "order", is_default)
select '00000000-0000-0000-0000-00000000000a', name, ord, true
from (values
  ('Novo lead', 1), ('Contato realizado', 2), ('Qualificado', 3),
  ('Reunião agendada', 4), ('Proposta enviada', 5), ('Negociação', 6),
  ('Fechado', 7), ('Perdido', 8), ('Follow-up futuro', 9)
) as s(name, ord)
on conflict (org_id, name) do nothing;

insert into loss_reasons (org_id, name)
select '00000000-0000-0000-0000-00000000000a', name
from (values ('Sem orçamento'), ('Fechou com concorrente'), ('Sem fit de momento'), ('Sem resposta')) as s(name)
on conflict (org_id, name) do nothing;

insert into cost_categories (org_id, name)
select '00000000-0000-0000-0000-00000000000a', name
from (values ('Equipe'), ('Ferramentas'), ('Freelancers'), ('Criativos'), ('Outros')) as s(name)
on conflict (org_id, name) do nothing;
