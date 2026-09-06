import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/session";
import { listAlerts } from "@/lib/data/alerts";

export const dynamic = "force-dynamic";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  const alerts = await listAlerts(user.orgId);
  return (
    <AppShell user={user} alerts={alerts}>
      {children}
    </AppShell>
  );
}
