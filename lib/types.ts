import type {
  ChargeStatus,
  ClientHealth,
  ClientStatus,
  ContractType,
  CostType,
  TaskPriority,
  TaskStatus,
} from "./labels";

export type UserRow = {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type ClientRow = {
  id: string;
  org_id: string;
  name: string;
  company: string | null;
  segment: string | null;
  primary_contact_name: string | null;
  responsible_user_id: string | null;
  status: ClientStatus;
  health: ClientHealth;
  plan_service: string | null;
  monthly_contract_value_cents: number;
  entry_date: string | null;
  contract_start_date: string | null;
  contract_due_date: string | null;
  renewal_date: string | null;
  goal: string | null;
  platform: string | null;
  objective: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientWithResponsible = ClientRow & {
  responsible: Pick<UserRow, "id" | "name"> | null;
};

export type ContractRow = {
  id: string;
  org_id: string;
  client_id: string;
  type: ContractType;
  value_cents: number;
  billing_day: number | null;
  start_date: string;
  end_date: string | null;
  status: string;
};

export type ChargeRow = {
  id: string;
  org_id: string;
  client_id: string;
  contract_id: string | null;
  competencia: string;
  due_date: string;
  value_cents: number;
  paid_value_cents: number;
  payment_method: string | null;
};

export type ChargeWithStatus = ChargeRow & { status: ChargeStatus };

export type CostCategoryRow = {
  id: string;
  org_id: string;
  name: string;
};

export type CostRow = {
  id: string;
  org_id: string;
  client_id: string;
  category_id: string | null;
  description: string | null;
  type: CostType;
  value_cents: number;
  competencia: string;
  cost_date: string;
};

export type MediaBudgetRow = {
  id: string;
  org_id: string;
  client_id: string;
  platform: string;
  competencia: string;
  planned_value_cents: number;
  spent_value_cents: number;
};

export type TaskRow = {
  id: string;
  org_id: string;
  client_id: string | null;
  related_entity_type: string;
  related_entity_id: string | null;
  title: string;
  description: string | null;
  responsible_user_id: string | null;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
};

export type TaskWithRelations = TaskRow & {
  responsible: Pick<UserRow, "id" | "name"> | null;
  client: Pick<ClientRow, "id" | "name"> | null;
};

export type KanbanStageRow = {
  id: string;
  org_id: string;
  name: string;
  order: number;
  is_default: boolean;
};

export type LossReasonRow = {
  id: string;
  org_id: string;
  name: string;
};

export type LeadInterestLevel = "baixo" | "medio" | "alto";

export type LeadRow = {
  id: string;
  org_id: string;
  stage_id: string;
  responsible_id: string | null;
  name: string;
  company: string | null;
  niche: string | null;
  origin: string | null;
  service_of_interest: string | null;
  potential_value_cents: number;
  interest_level: LeadInterestLevel;
  next_action: string | null;
  next_contact_date: string | null;
  notes: string | null;
  lost_reason_id: string | null;
  converted_client_id: string | null;
  created_at: string;
};

export type LeadWithRelations = LeadRow & {
  responsible: Pick<UserRow, "id" | "name"> | null;
};

export type CampaignRow = {
  id: string;
  org_id: string;
  client_id: string;
  name: string;
  platform: string;
  objective: string | null;
  status: "planejada" | "ativa" | "pausada" | "encerrada";
  period_start: string | null;
  period_end: string | null;
  budget_cents: number;
  spent_cents: number;
  audience: string | null;
  offer: string | null;
  landing_page: string | null;
  notes: string | null;
};

export type CampaignWithClient = CampaignRow & { client: { id: string; name: string } | null };

export type CampaignMetricRow = {
  id: string;
  campaign_id: string;
  period: string;
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

export type StrategyRow = {
  id: string;
  org_id: string;
  client_id: string;
  version_number: number;
  status: "atual" | "arquivada";
  created_by: string | null;
  created_at: string;
};

export type StrategySectionRow = {
  id: string;
  strategy_id: string;
  section_type: string;
  order: number;
  content: { text?: string };
};

export type StrategyTemplateRow = {
  id: string;
  org_id: string;
  name: string;
  sections: { section_type: string; order: number; content: { text?: string } }[];
  created_at: string;
};

export type MetricGoalRow = {
  id: string;
  org_id: string;
  client_id: string;
  metric_name: string;
  target_value: number;
  period: string;
};
