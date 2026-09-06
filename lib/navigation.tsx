import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Megaphone,
  LineChart,
  BookOpenText,
  Wallet,
  ListChecks,
  FileBarChart,
  UsersRound,
  Settings,
} from "lucide-react";
import type { ModuleKey } from "./permissions";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  module: ModuleKey;
  /** aparece na barra inferior do mobile (máx. 5, incl. "Mais") */
  mobilePrimary?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "dashboard", mobilePrimary: true },
  { label: "Clientes", href: "/clientes", icon: Users, module: "clientes", mobilePrimary: true },
  { label: "Prospecção", href: "/prospeccao", icon: KanbanSquare, module: "prospeccao", mobilePrimary: true },
  { label: "Campanhas", href: "/campanhas", icon: Megaphone, module: "campanhas_metricas" },
  { label: "Métricas", href: "/metricas", icon: LineChart, module: "campanhas_metricas" },
  { label: "Estratégias", href: "/estrategias", icon: BookOpenText, module: "estrategias" },
  { label: "Financeiro", href: "/financeiro", icon: Wallet, module: "financeiro_cliente" },
  { label: "Pendências", href: "/pendencias", icon: ListChecks, module: "pendencias", mobilePrimary: true },
  { label: "Relatórios", href: "/relatorios", icon: FileBarChart, module: "relatorios" },
  { label: "Equipe", href: "/equipe", icon: UsersRound, module: "equipe" },
  { label: "Configurações", href: "/configuracoes", icon: Settings, module: "configuracoes" },
];
