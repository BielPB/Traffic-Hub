import type { Role } from "./permissions";

// Sessão temporária enquanto não há tela de login (ver blueprint, Fase 0 → Fase 7).
// Troca para Supabase Auth acontece sem mudar o formato de CurrentUser abaixo.
export type CurrentUser = {
  id: string;
  orgId: string;
  orgName: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
};

const SEEDED_ADMIN: CurrentUser = {
  id: "00000000-0000-0000-0000-000000000001",
  orgId: "00000000-0000-0000-0000-00000000000a",
  orgName: "Traffic Hub Demo",
  name: "Ana Beatriz",
  email: "ana@trafficdemo.com",
  role: "administrador",
  avatarInitials: "AB",
};

export function getCurrentUser(): CurrentUser {
  return SEEDED_ADMIN;
}
