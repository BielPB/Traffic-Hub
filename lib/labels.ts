export type ClientStatus =
  | "onboarding"
  | "planejamento"
  | "ativo"
  | "atencao"
  | "pausado"
  | "encerrado";

export type ClientHealth = "saudavel" | "atencao" | "critico";
export type ChargeStatus = "pendente" | "parcial" | "pago" | "vencido";
export type ContractType = "recorrente" | "avulso";
export type CostType = "interno" | "externo";
export type TaskPriority = "baixa" | "media" | "alta";
export type TaskStatus = "pendente" | "em_andamento" | "concluida";

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  onboarding: "Onboarding",
  planejamento: "Planejamento",
  ativo: "Ativo",
  atencao: "Atenção",
  pausado: "Pausado",
  encerrado: "Encerrado",
};

export const CLIENT_STATUS_TONE: Record<ClientStatus, "purple" | "blue" | "success" | "warning" | "danger" | "muted"> = {
  onboarding: "blue",
  planejamento: "blue",
  ativo: "success",
  atencao: "warning",
  pausado: "muted",
  encerrado: "danger",
};

export const CLIENT_HEALTH_LABELS: Record<ClientHealth, string> = {
  saudavel: "Saudável",
  atencao: "Atenção",
  critico: "Crítico",
};

export const CLIENT_HEALTH_TONE: Record<ClientHealth, "success" | "warning" | "danger"> = {
  saudavel: "success",
  atencao: "warning",
  critico: "danger",
};

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pendente: "Pendente",
  parcial: "Parcial",
  pago: "Pago",
  vencido: "Vencido",
};

export const CHARGE_STATUS_TONE: Record<ChargeStatus, "success" | "warning" | "danger" | "muted"> = {
  pendente: "muted",
  parcial: "warning",
  pago: "success",
  vencido: "danger",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  recorrente: "Recorrente",
  avulso: "Avulso",
};

export const COST_TYPE_LABELS: Record<CostType, string> = {
  interno: "Interno",
  externo: "Externo",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const TASK_PRIORITY_TONE: Record<TaskPriority, "muted" | "warning" | "danger"> = {
  baixa: "muted",
  media: "warning",
  alta: "danger",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};
