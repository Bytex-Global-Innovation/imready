import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, error, id, children, ...props }, ref) {
    return (
      <div className="w-full">
        <select
          ref={ref}
          id={id}
          className={cn(
            "h-11 w-full appearance-none rounded-[var(--radius-button)] border bg-white px-3.5 text-sm text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:border-brand-500",
            error
              ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400"
              : "border-border",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p
            id={`${id}-error`}
            className="mt-1.5 text-xs text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
