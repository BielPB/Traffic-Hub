export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { listAllOrgUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";
import { createUserAction, updateUserRoleAction, toggleUserStatusAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";

export default async function EquipePage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const currentUser = getCurrentUser();
  const users = await listAllOrgUsers(currentUser.orgId);

  return (
    <>
      <PageHeader title="Equipe" description="Usuários e papéis da agência." />

      {erro && <div className="mb-4 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{erro}</div>}

      <Card className="mb-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-faint">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-text">{u.name}</td>
                <td className="px-4 py-3 text-text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <form action={updateUserRoleAction.bind(null, u.id)} className="flex items-center gap-1.5">
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="h-9 rounded-lg border border-border bg-surface-alt px-2 text-xs text-text"
                    >
                      {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                    <button type="submit" className="text-xs font-medium text-purple-dark hover:underline">Salvar</button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.status === "ativo" ? "success" : "muted"}>{u.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleUserStatusAction.bind(null, u.id, u.status === "ativo" ? "inativo" : "ativo")}>
                    <button className="text-xs font-medium text-purple-dark hover:underline">
                      {u.status === "ativo" ? "Desativar" : "Reativar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Adicionar usuário</h2>
        <p className="mb-3 -mt-1 text-xs text-text-faint">
          Sem login real ainda (Fase 7) — este cadastro só registra o usuário e o papel dele no sistema.
        </p>
        <form action={createUserAction} className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input name="name" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input type="email" name="email" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Papel</label>
            <select name="role" defaultValue="visualizador" className={inputClass}>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="h-10 w-full rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
              Adicionar
            </button>
          </div>
        </form>
      </Card>
    </>
  );
}
