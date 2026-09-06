"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { canAccess, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function MobileTabBar({ role, onOpenMore }: { role: Role; onOpenMore: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.mobilePrimary && canAccess(role, item.module));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
              active ? "text-purple-dark" : "text-text-faint",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMore}
        className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-text-faint"
      >
        <MoreHorizontal className="size-5" strokeWidth={1.8} />
        Mais
      </button>
    </nav>
  );
}
