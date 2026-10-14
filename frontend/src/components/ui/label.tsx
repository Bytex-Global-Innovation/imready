import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  children,
  className,
  required,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-semibold text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-brand-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
