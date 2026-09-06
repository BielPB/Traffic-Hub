-- Traffic Hub — schema inicial
-- Ver blueprint (Fase 0) para o modelo de dados completo e as relações.
-- Valores monetários são gravados em centavos (bigint) para evitar erro de
-- ponto flutuante; a UI divide por 100 na exibição (ver lib/utils.ts).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('administrador','coordenador','gestor_trafego','comercial','financeiro','visualizador');
create type user_status as enum ('ativo','inativo');

create type client_status as enum ('onboarding','planejamento','ativo','atencao','pausado','encerrado');
create type client_health as enum ('saudavel','atencao','critico');

create type contract_type as enum ('recorrente','avulso');
create type contract_status as enum ('ativo','encerrado');
create type charge_status as enum ('pendente','parcial','pago','vencido');
create type cost_type as enum ('interno','externo');

create type lead_interest_level as enum ('baixo','medio','alto');

create type campaign_status as enum ('planejada','ativa','pausada','encerrada');

create type strategy_status as enum ('atual','arquivada');

create type task_related_entity as enum ('client','campaign','strategy','lead');
create type task_priority as enum ('baixa','media','alta');
create type task_status as enum ('pendente','em_andamento','concluida');

create type note_entity_type as enum ('client','lead','campaign','strategy','task');

-- ---------------------------------------------------------------------------
-- util: updated_at automático
-- ---------------------------------------------------------------------------
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- organizações e pessoas
-- ---------------------------------------------------------------------------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  currency text not null default 'BRL',
  date_format text not null default 'DD/MM/YYYY',
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_organizations_updated_at before update on organizations
  for each row execute function set_updated_at();

create table users (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  auth_user_id uuid, -- preenchido quando a Fase 7 ligar ao Supabase Auth
  name text not null,
  email text not null,
  role user_role not null default 'visualizador',
  status user_status not null default 'ativo',
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, email)
);
create index idx_users_org on users(org_id);
create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- comercial: kanban de prospecção
-- ---------------------------------------------------------------------------
create table kanban_stages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  "order" int not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_kanban_stages_org on kanban_stages(org_id);

create table loss_reasons (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null
);
create index idx_loss_reasons_org on loss_reasons(org_id);

-- clients é criada antes de leads por causa do FK converted_client_id? Na
-- verdade o inverso: leads referencia clients, então clients vem primeiro.
create table clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  company text,
  segment text,
  primary_contact_name text,
  primary_contact_channels jsonb not null default '[]',
  responsible_user_id uuid references users(id) on delete set null,
  status client_status not null default 'onboarding',
  health client_health not null default 'saudavel',
  plan_service text,
  monthly_contract_value_cents bigint not null default 0,
  entry_date date,
  contract_start_date date,
  contract_due_date date,
  renewal_date date,
  goal text,
  platform text,
  objective text,
  next_action text,
  custom_fields jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_clients_org on clients(org_id);
create index idx_clients_responsible on clients(responsible_user_id);
create trigger trg_clients_updated_at before update on clients
  for each row execute function set_updated_at();

create table client_team_members (
  client_id uuid not null references clients(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role_in_client text,
  primary key (client_id, user_id)
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  stage_id uuid not null references kanban_stages(id),
  responsible_id uuid references users(id) on delete set null,
  name text not null,
  company text,
  niche text,
  origin text,
  service_of_interest text,
  potential_value_cents bigint not null default 0,
  interest_level lead_interest_level not null default 'medio',
  next_action text,
  next_contact_date date,
  notes text,
  lost_reason_id uuid references loss_reasons(id) on delete set null,
  converted_client_id uuid references clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_leads_org on leads(org_id);
create index idx_leads_stage on leads(stage_id);
create trigger trg_leads_updated_at before update on leads
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- financeiro
-- ---------------------------------------------------------------------------
create table contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  type contract_type not null default 'recorrente',
  value_cents bigint not null,
  billing_day int,
  start_date date not null,
  end_date date,
  status contract_status not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_contracts_client on contracts(client_id);
create trigger trg_contracts_updated_at before update on contracts
  for each row execute function set_updated_at();

create table charges (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  contract_id uuid references contracts(id) on delete set null,
  competencia text not null, -- 'AAAA-MM'
  due_date date not null,
  value_cents bigint not null,
  paid_value_cents bigint not null default 0,
  status charge_status not null default 'pendente',
  payment_method text,
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_charges_client on charges(client_id);
create index idx_charges_due_date on charges(due_date);
create trigger trg_charges_updated_at before update on charges
  for each row execute function set_updated_at();

create table cost_categories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null
);
create index idx_cost_categories_org on cost_categories(org_id);

create table costs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  category_id uuid references cost_categories(id) on delete set null,
  description text,
  type cost_type not null default 'interno',
  value_cents bigint not null,
  competencia text not null,
  cost_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index idx_costs_client on costs(client_id);

create table media_budgets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  platform text not null,
  competencia text not null,
  planned_value_cents bigint not null default 0,
  spent_value_cents bigint not null default 0,
  created_at timestamptz not null default now()
);
create index idx_media_budgets_client on media_budgets(client_id);

-- ---------------------------------------------------------------------------
-- campanhas e métricas
-- ---------------------------------------------------------------------------
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  platform text not null,
  objective text,
  status campaign_status not null default 'planejada',
  period_start date,
  period_end date,
  budget_cents bigint not null default 0,
  spent_cents bigint not null default 0,
  audience text,
  offer text,
  landing_page text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_campaigns_client on campaigns(client_id);
create trigger trg_campaigns_updated_at before update on campaigns
  for each row execute function set_updated_at();

-- Métricas brutas por período; CTR/CPC/CPL/CPA/ROAS são sempre calculados em
-- consulta (view/aplicação), nunca gravados, para não dessincronizar da fórmula.
create table campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  period date not null,
  impressions bigint not null default 0,
  reach bigint not null default 0,
  clicks bigint not null default 0,
  leads bigint not null default 0,
  conversions bigint not null default 0,
  appointments bigint not null default 0,
  shows bigint not null default 0,
  sales bigint not null default 0,
  spent_cents bigint not null default 0,
  attributed_revenue_cents bigint not null default 0,
  created_at timestamptz not null default now(),
  unique (campaign_id, period)
);
create index idx_campaign_metrics_campaign on campaign_metrics(campaign_id);

create table metric_goals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  metric_name text not null,
  target_value numeric not null,
  period text not null
);
create index idx_metric_goals_client on metric_goals(client_id);

-- ---------------------------------------------------------------------------
-- estratégia
-- ---------------------------------------------------------------------------
create table strategy_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  sections jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table strategies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  version_number int not null default 1,
  status strategy_status not null default 'atual',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_strategies_client on strategies(client_id);

create table strategy_sections (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references strategies(id) on delete cascade,
  section_type text not null,
  "order" int not null,
  content jsonb not null default '{}'
);
create index idx_strategy_sections_strategy on strategy_sections(strategy_id);

-- ---------------------------------------------------------------------------
-- operação: tarefas, comentários, anexos, auditoria, relatórios, notificações
-- ---------------------------------------------------------------------------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  related_entity_type task_related_entity not null default 'client',
  related_entity_id uuid,
  title text not null,
  description text,
  responsible_user_id uuid references users(id) on delete set null,
  priority task_priority not null default 'media',
  due_date date,
  status task_status not null default 'pendente',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_tasks_org on tasks(org_id);
create index idx_tasks_responsible on tasks(responsible_user_id);
create index idx_tasks_due_date on tasks(due_date);
create trigger trg_tasks_updated_at before update on tasks
  for each row execute function set_updated_at();

create table comments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  entity_type note_entity_type not null,
  entity_id uuid not null,
  author_id uuid references users(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);
create index idx_comments_entity on comments(entity_type, entity_id);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  entity_type note_entity_type not null,
  entity_id uuid not null,
  file_name text not null,
  url text not null,
  size_bytes bigint,
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_attachments_entity on attachments(entity_type, entity_id);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_log_entity on audit_log(entity_type, entity_id);
create index idx_audit_log_org on audit_log(org_id);

create table reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  type text not null default 'individual', -- individual | consolidado
  period_start date not null,
  period_end date not null,
  config jsonb not null default '{}',
  generated_by uuid references users(id) on delete set null,
  generated_at timestamptz not null default now()
);
create index idx_reports_client on reports(client_id);

create table notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  channel text not null default 'in_app',
  enabled boolean not null default true,
  unique (user_id, type, channel)
);
