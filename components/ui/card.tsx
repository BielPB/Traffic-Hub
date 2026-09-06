import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,.3),0_12px_32px_-14px_rgba(0,0,0,.55)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
