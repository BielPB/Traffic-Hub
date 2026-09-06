import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/session";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  return <AppShell user={user}>{children}</AppShell>;
}
