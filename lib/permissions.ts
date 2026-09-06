// Matriz de permissões do Traffic Hub — ver blueprint, seção "Perfis e permissões".
// Fixa no MVP (Fase 0-6); tornar cada papel configurável é item da Fase 7+.

export type Role =
  | "administrador"
  | "coordenador"
  | "gestor_trafego"
  | "comercial"
  | "financeiro"
  | "visualizador";

export type ModuleKey =
  | "dashboard"
  | "clientes"
  | "financeiro_cliente"
  | "campanhas_metricas"
  | "estrategias"
  | "prospeccao"
  | "pendencias"
  | "relatorios"
  | "equipe"
  | "configuracoes";

export type PermissionLevel = "total" | "editar" | "ver" | "proprios" | "oculto";

export const ROLE_LABELS: Record<Role, string> = {
  administrador: "Administrador",
  coordenador: "Coordenador",
  gestor_trafego: "Gestor de tráfego",
  comercial: "Comercial",
  financeiro: "Financeiro",
  visualizador: "Visualizador",
};

const T: PermissionLevel = "total";
const V: PermissionLevel = "ver";
const P: PermissionLevel = "proprios";
const O: PermissionLevel = "oculto";

export const PERMISSION_MATRIX: Record<ModuleKey, Record<Role, PermissionLevel>> = {
  dashboard: { administrador: T, coordenador: T, gestor_trafego: P, comercial: V, financeiro: V, visualizador: V },
  clientes: { administrador: T, coordenador: T, gestor_trafego: P, comercial: V, financeiro: V, visualizador: V },
  financeiro_cliente: { administrador: T, coordenador: V, gestor_trafego: O, comercial: O, financeiro: T, visualizador: O },
  campanhas_metricas: { administrador: T, coordenador: T, gestor_trafego: P, comercial: O, financeiro: O, visualizador: V },
  estrategias: { administrador: T, coordenador: T, gestor_trafego: P, comercial: V, financeiro: O, visualizador: O },
  prospeccao: { administrador: T, coordenador: T, gestor_trafego: O, comercial: T, financeiro: O, visualizador: O },
  pendencias: { administrador: T, coordenador: T, gestor_trafego: P, comercial: P, financeiro: P, visualizador: O },
  relatorios: { administrador: T, coordenador: T, gestor_trafego: P, comercial: O, financeiro: V, visualizador: V },
  equipe: { administrador: T, coordenador: V, gestor_trafego: O, comercial: O, financeiro: O, visualizador: O },
  configuracoes: { administrador: T, coordenador: O, gestor_trafego: O, comercial: O, financeiro: O, visualizador: O },
};

export function permissionLevel(role: Role, module: ModuleKey): PermissionLevel {
  return PERMISSION_MATRIX[module][role];
}

export function canAccess(role: Role, module: ModuleKey): boolean {
  return permissionLevel(role, module) !== "oculto";
}

export function canEdit(role: Role, module: ModuleKey): boolean {
  const level = permissionLevel(role, module);
  return level === "total" || level === "editar" || level === "proprios";
}
