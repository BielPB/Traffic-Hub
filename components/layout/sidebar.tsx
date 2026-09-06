"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Radar } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { canAccess, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  collapsed,
  onToggle,
}: {
  role: Role;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => canAccess(role, item.module));

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-150 md:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple to-blue">
          <Radar className="size-5 text-white" strokeWidth={2} />
        </div>
        {!collapsed && (
          <span className="truncate text-[15px] font-semibold tracking-tight text-text">
            Traffic Hub
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-purple/20 to-blue/10 text-text"
                  : "text-text-muted hover:bg-surface-hover hover:text-text",
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.1 : 1.8} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        className="flex min-h-11 items-center gap-3 border-t border-border px-3 mx-3 mb-3 mt-1 rounded-lg text-text-faint hover:bg-surface-hover hover:text-text"
      >
        {collapsed ? <ChevronsRight className="size-[18px]" /> : <ChevronsLeft className="size-[18px]" />}
        {!collapsed && <span className="text-sm">Recolher</span>}
      </button>
    </aside>
  );
}
