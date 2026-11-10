import { cn } from "@/lib/utils";

export function MaterialSymbol({
  name,
  className,
  filled,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={cn("material-symbols-outlined leading-none", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden
    >
      {name}
    </span>
  );
}
