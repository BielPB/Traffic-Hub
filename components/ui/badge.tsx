import { cn } from "@/lib/utils";

type BadgeTone = "purple" | "blue" | "success" | "warning" | "danger" | "muted";

const TONE_CLASSES: Record<BadgeTone, string> = {
  purple: "bg-purple/15 text-purple-dark",
  blue: "bg-blue/15 text-blue-bright",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  muted: "bg-surface-alt text-text-faint border border-border",
};

export function Badge({
  tone = "muted",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
