import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, error, id, ...props }, ref) {
    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-11 w-full rounded-[var(--radius-button)] border bg-white px-3.5 text-sm text-foreground placeholder:text-muted/70 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:border-brand-500",
            error
              ? "border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-400"
              : "border-border",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
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
