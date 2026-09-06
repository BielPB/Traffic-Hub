"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const base = `/clientes/${clientId}`;
  const tabs = [
    { label: "Visão geral", href: base },
    { label: "Campanhas e métricas", href: `${base}/campanhas` },
    { label: "Financeiro", href: `${base}/financeiro` },
    { label: "Estratégia", href: `${base}/estrategia` },
    { label: "Pendências", href: `${base}/pendencias` },
    { label: "Anotações e histórico", href: `${base}/anotacoes` },
    { label: "Arquivos e links", href: `${base}/arquivos` },
  ];

  return (
    <div className="mb-6 -mx-1 flex gap-1 overflow-x-auto border-b border-border pb-px scrollbar-thin">
      {tabs.map((tab) => {
        const active = tab.href === base ? pathname === base : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium",
              active ? "border-purple text-text" : "border-transparent text-text-faint hover:text-text-muted",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
