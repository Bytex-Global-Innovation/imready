import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  showAccent?: boolean;
}

export function SectionLabel({
  children,
  className,
  showAccent = true,
}: SectionLabelProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {showAccent && (
        <span className="h-1 w-10 rounded-full bg-accent" aria-hidden="true" />
      )}
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
        {children}
      </p>
    </div>
  );
}
