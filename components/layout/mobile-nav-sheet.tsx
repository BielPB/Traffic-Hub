"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { canAccess, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function MobileNavSheet({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
}) {
  const pathname = usePathname();
  if (!open) return null;

  const items = NAV_ITEMS.filter((item) => canAccess(role, item.module));

  return (
    <div className="fixed inset-0 z-30 md:hidden">
      <button
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface">
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-[15px] font-semibold text-text">Traffic Hub</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-11 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
                  active ? "bg-gradient-to-r from-purple/20 to-blue/10 text-text" : "text-text-muted",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={active ? 2.1 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
