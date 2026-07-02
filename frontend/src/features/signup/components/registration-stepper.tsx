import { cn } from "@/lib/utils";
import { SIGNUP_STEPS } from "../schemas/signup-schemas";

interface RegistrationStepperProps {
  currentStep: number;
}

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  return (
    <nav aria-label="Registration progress" className="w-full">
      <ol className="flex items-start justify-between">
        {SIGNUP_STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = index === SIGNUP_STEPS.length - 1;

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex flex-1 flex-col items-center",
                !isLast && "pr-2 sm:pr-4",
              )}
            >
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[calc(50%+1rem)] top-4 hidden h-0.5 w-[calc(100%-2rem)] sm:block",
                    isCompleted ? "bg-[#153a75]" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}

              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors sm:h-9 sm:w-9",
                  isActive || isCompleted
                    ? "bg-[#153a75] text-white hover:bg-[#102b55]"
                    : "border border-border bg-gray-100 text-[#153a75]",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {step.id}
              </div>

              <span
                className={cn(
                  "mt-2 text-center text-[0.65rem] font-medium leading-tight sm:text-xs",
                  isActive || isCompleted ? "text-[#153a75]" : "text-muted",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
