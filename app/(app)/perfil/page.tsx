import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";

export default function PerfilPage() {
  const user = getCurrentUser();

  return (
    <>
      <PageHeader title="Perfil" description="Dados da conta com a qual você está usando o Traffic Hub agora." />
      <Card className="max-w-xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-purple to-blue text-lg font-semibold text-white">
            {user.avatarInitials}
          </div>
          <div>
            <p className="text-base font-semibold text-text">{user.name}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
          <div>
            <dt className="text-text-faint">Organização</dt>
            <dd className="mt-1 font-medium text-text">{user.orgName}</dd>
          </div>
          <div>
            <dt className="text-text-faint">Papel</dt>
            <dd className="mt-1">
              <Badge tone="purple">{ROLE_LABELS[user.role]}</Badge>
            </dd>
          </div>
        </dl>

        <p className="mt-6 rounded-lg border border-border bg-surface-alt px-4 py-3 text-xs text-text-faint">
          Esta é a sessão semente usada enquanto não há tela de login (ver blueprint, Fase 0). Edição de
          preferências e troca de senha chegam com a autenticação real, na Fase 7.
        </p>
      </Card>
    </>
  );
}
