import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-badge)] bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
