"use client";

import { useState } from "react";
import type { CurrentUser } from "@/lib/session";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileTabBar } from "./mobile-tab-bar";
import { MobileNavSheet } from "./mobile-nav-sheet";

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <Sidebar role={user.role} collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <MobileNavSheet open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} role={user.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          userName={user.name}
          orgName={user.orgName}
          role={user.role}
          avatarInitials={user.avatarInitials}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <MobileTabBar role={user.role} onOpenMore={() => setMobileNavOpen(true)} />
    </div>
  );
}
