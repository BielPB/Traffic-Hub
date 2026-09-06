"use client";

import { Menu, Search } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { NotificationBell } from "./notification-bell";
import type { Alert } from "@/lib/data/alerts";

export function TopBar({
  userName,
  orgName,
  role,
  avatarInitials,
  alerts,
  onOpenMobileNav,
}: {
  userName: string;
  orgName: string;
  role: Role;
  avatarInitials: string;
  alerts: Alert[];
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Abrir menu"
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <form action="/busca" className="flex min-w-0 flex-1 items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
          <input
            type="search"
            name="q"
            placeholder="Buscar clientes, leads, campanhas..."
            className="h-10 w-full rounded-lg border border-border bg-surface-alt pl-9 pr-3 text-sm text-text placeholder:text-text-faint focus:border-purple"
          />
        </div>
      </form>

      <NotificationBell alerts={alerts} />

      <div className="flex shrink-0 items-center gap-2.5 border-l border-border pl-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-purple to-blue text-xs font-semibold text-white">
          {avatarInitials}
        </div>
        <div className="hidden leading-tight lg:block">
          <p className="text-sm font-medium text-text">{userName}</p>
          <p className="text-xs text-text-faint">
            {orgName} · {ROLE_LABELS[role]}
          </p>
        </div>
      </div>
    </header>
  );
}
