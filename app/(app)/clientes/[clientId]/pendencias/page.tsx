export const dynamic = "force-dynamic";

import { ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_TONE } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { listTasks } from "@/lib/data/tasks";
import { listOrgUsers } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/session";
import { createClientTaskAction, setTaskStatusAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";

export default async function ClientePendenciasPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { clientId } = await params;
  const { erro } = await searchParams;
  const user = getCurrentUser();
  const [tasks, users] = await Promise.all([
    listTasks(user.orgId, { clientId }),
    listOrgUsers(user.orgId),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const open = tasks.filter((t) => t.status !== "concluida");
  const done = tasks.filter((t) => t.status === "concluida");

  return (
    <div className="space-y-6">
      {erro && <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{erro}</div>}

      <Card className="p-5">
        {open.length === 0 ? (
          <EmptyState icon={ListChecks} title="Nenhuma pendência em aberto" description="Cadastre a primeira tarefa deste cliente abaixo." />
        ) : (
          <ul className="divide-y divide-border">
            {open.map((task) => {
              const overdue = task.due_date && task.due_date < today;
              return (
                <li key={task.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-faint">
                      <Badge tone={TASK_PRIORITY_TONE[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                      {task.due_date && <span className={overdue ? "font-medium text-danger" : ""}>Prazo: {formatDate(task.due_date)}</span>}
                      {task.responsible && <span>{task.responsible.name}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {task.status !== "em_andamento" && (
                      <form action={setTaskStatusAction.bind(null, clientId, task.id, "em_andamento")}>
                        <button className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-hover">Em andamento</button>
                      </form>
                    )}
                    <form action={setTaskStatusAction.bind(null, clientId, task.id, "concluida")}>
                      <button className="h-9 rounded-lg bg-success-bg px-3 text-xs font-medium text-success">Concluir</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form action={createClientTaskAction.bind(null, clientId)} className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Título</label>
            <input name="title" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Responsável</label>
            <select name="responsible_user_id" className={inputClass}>
              <option value="">Sem responsável</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Prazo</label>
            <input name="due_date" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prioridade</label>
            <select name="priority" className={inputClass} defaultValue="media">
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button type="submit" className="h-10 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
              Adicionar pendência
            </button>
          </div>
        </form>
      </Card>

      {done.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-faint">Concluídas</h3>
          <ul className="divide-y divide-border">
            {done.map((task) => (
              <li key={task.id} className="py-2.5 text-sm text-text-faint line-through">{task.title}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
