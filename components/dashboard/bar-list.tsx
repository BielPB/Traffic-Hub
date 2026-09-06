import { Card } from "@/components/ui/card";

export function BarList({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number; tone?: "purple" | "blue" | "success" | "warning" | "danger" | "muted" }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const toneClass = {
    purple: "bg-purple",
    blue: "bg-blue",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-text-faint",
  };

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-faint">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-muted">{item.label}</span>
              <span className="font-medium text-text">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-alt">
              <div
                className={`h-full rounded-full ${toneClass[item.tone ?? "purple"]}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-text-faint">Sem dados ainda.</p>}
      </div>
    </Card>
  );
}
