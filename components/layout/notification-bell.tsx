"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Alert } from "@/lib/data/alerts";

export function NotificationBell({ alerts = [] }: { alerts?: Alert[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        className="relative flex size-11 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover"
      >
        <Bell className="size-5" />
        {alerts.length > 0 && <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger" />}
      </button>

      {open && (
        <>
          <button aria-label="Fechar notificações" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-72 rounded-xl border border-border bg-surface p-2 shadow-lg">
            {alerts.length === 0 ? (
              <p className="p-3 text-sm text-text-faint">Nenhum alerta no momento.</p>
            ) : (
              alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg p-2.5 text-sm hover:bg-surface-alt"
                >
                  <span className={`size-2 shrink-0 rounded-full ${alert.severity === "danger" ? "bg-danger" : "bg-warning"}`} />
                  <span className="text-text">{alert.label}</span>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
