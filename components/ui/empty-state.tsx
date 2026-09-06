import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Explica objetivamente quando o módulo entrega funcionalidade real — nunca uma tela vazia sem explicação. */
  phase?: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-alt text-purple-dark">
        <Icon className="size-6" strokeWidth={1.6} />
      </div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      <p className="max-w-md text-sm text-text-muted">{description}</p>
      {phase && (
        <span className="mt-1 rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-text-faint">
          {phase}
        </span>
      )}
    </Card>
  );
}
