export const dynamic = "force-dynamic";

import Link from "next/link";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_TONE } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { listTasks } from "@/lib/data/tasks";
import { listOrgUsers } from "@/lib/data/users";
import { listClients } from "@/lib/data/clients";
import { getCurrentUser } from "@/lib/session";
import { createTaskAction, setTaskStatusAction } from "./actions";
import type { TaskWithRelations } from "@/lib/types";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface-alt px-3 text-sm text-text placeholder:text-text-faint focus:border-purple";
const labelClass = "mb-1 block text-xs font-medium text-text-faint";

function TaskGroup({ title, tasks, tone }: { title: string; tasks: TaskWithRelations[]; tone?: "danger" }) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <h3 className={`mb-2 text-sm font-semibold ${tone === "danger" ? "text-danger" : "text-text-faint"}`}>
        {title} <span className="font-normal">({tasks.length})</span>
      </h3>
      <ul className="divide-y divide-border rounded-xl border border-border">
        {tasks.map((task) => (
          <li key={task.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text">{task.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-faint">
                <Badge tone={TASK_PRIORITY_TONE[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                {task.client && (
                  <Link href={`/clientes/${task.client.id}/pendencias`} className="hover:underline">{task.client.name}</Link>
                )}
                {task.due_date && <span>Prazo: {formatDate(task.due_date)}</span>}
                {task.responsible && <span>{task.responsible.name}</span>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {task.status !== "em_andamento" && (
                <form action={setTaskStatusAction.bind(null, task.id, "em_andamento")}>
                  <button className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-text-muted hover:bg-surface-hover">Em andamento</button>
                </form>
              )}
              <form action={setTaskStatusAction.bind(null, task.id, "concluida")}>
                <button className="h-9 rounded-lg bg-success-bg px-3 text-xs font-medium text-success">Concluir</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function PendenciasPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const user = getCurrentUser();
  const [tasks, users, clients] = await Promise.all([
    listTasks(user.orgId),
    listOrgUsers(user.orgId),
    listClients(user.orgId),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const open = tasks.filter((t) => t.status !== "concluida");
  const overdue = open.filter((t) => t.due_date && t.due_date < today);
  const dueToday = open.filter((t) => t.due_date === today);
  const upcoming = open.filter((t) => !t.due_date || t.due_date > today);

  return (
    <>
      <PageHeader title="Pendências" description="Tarefas de todos os clientes, por responsável e por vencimento." />

      {erro && <div className="mb-4 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{erro}</div>}

      <Card className="mb-6 p-5">
        <form action={createTaskAction} className="grid gap-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Título</label>
            <input name="title" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Cliente</label>
            <select name="client_id" className={inputClass}>
              <option value="">Sem cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
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
          <div className="sm:col-span-5 flex justify-end">
            <button type="submit" className="h-10 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white">
              Adicionar pendência
            </button>
          </div>
        </form>
      </Card>

      {open.length === 0 ? (
        <EmptyState icon={ListChecks} title="Nenhuma pendência em aberto" description="Todas as tarefas foram concluídas — ou nenhuma foi criada ainda." />
      ) : (
        <div className="space-y-6">
          <TaskGroup title="Vencidas" tasks={overdue} tone="danger" />
          <TaskGroup title="Hoje" tasks={dueToday} />
          <TaskGroup title="Futuras" tasks={upcoming} />
        </div>
      )}
    </>
  );
}
