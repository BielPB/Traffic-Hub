-- Row Level Security — fronteira de isolamento entre agências (organizations).
-- current_org_id() resolve a organização do usuário autenticado via
-- users.auth_user_id; até a Fase 7 (login real) nada nesta base é acessado
-- com a chave anon, só com a service role (que ignora RLS), então estas
-- políticas ficam prontas e testáveis sem travar o desenvolvimento atual.

create function current_org_id() returns uuid as $$
  select org_id from users where auth_user_id = auth.uid() limit 1;
$$ language sql stable security definer;

alter table organizations enable row level security;
create policy org_isolation on organizations
  for all using (id = current_org_id()) with check (id = current_org_id());

-- tabelas com org_id direto
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'users','clients','kanban_stages','loss_reasons','leads',
    'contracts','charges','cost_categories','costs','media_budgets',
    'campaigns','metric_goals','strategy_templates','strategies',
    'tasks','comments','attachments','audit_log','reports'
  ])
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy org_isolation on %I for all using (org_id = current_org_id()) with check (org_id = current_org_id())',
      t
    );
  end loop;
end $$;

-- tabelas sem org_id direto: isolam via join com a tabela dona do registro
alter table client_team_members enable row level security;
create policy org_isolation on client_team_members
  for all using (
    exists (select 1 from clients c where c.id = client_team_members.client_id and c.org_id = current_org_id())
  ) with check (
    exists (select 1 from clients c where c.id = client_team_members.client_id and c.org_id = current_org_id())
  );

alter table campaign_metrics enable row level security;
create policy org_isolation on campaign_metrics
  for all using (
    exists (select 1 from campaigns cp where cp.id = campaign_metrics.campaign_id and cp.org_id = current_org_id())
  ) with check (
    exists (select 1 from campaigns cp where cp.id = campaign_metrics.campaign_id and cp.org_id = current_org_id())
  );

alter table strategy_sections enable row level security;
create policy org_isolation on strategy_sections
  for all using (
    exists (select 1 from strategies s where s.id = strategy_sections.strategy_id and s.org_id = current_org_id())
  ) with check (
    exists (select 1 from strategies s where s.id = strategy_sections.strategy_id and s.org_id = current_org_id())
  );

alter table notification_settings enable row level security;
create policy own_notifications on notification_settings
  for all using (
    exists (select 1 from users u where u.id = notification_settings.user_id and u.org_id = current_org_id())
  ) with check (
    exists (select 1 from users u where u.id = notification_settings.user_id and u.org_id = current_org_id())
  );

-- Regra financeira (seção 3 do blueprint): papéis sem acesso a dado financeiro
-- não devem ler contracts/charges/costs/media_budgets mesmo dentro da própria
-- organização. Entra como policy adicional quando a Fase 1 ligar os módulos
-- financeiros a esta tabela de papéis — hoje o isolamento por organização já
-- está ativo, que é o requisito não-negociável desta fase.
