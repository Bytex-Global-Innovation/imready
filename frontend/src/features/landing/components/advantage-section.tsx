import { COMPARISON_ROWS, ROUTES } from "@/constants";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type StatusType = "positive" | "negative" | "neutral";

function StatusIcon({ status }: { status: StatusType }) {
  if (status === "positive") {
    return (
      <svg
        className="mx-auto h-6 w-6 text-brand-600"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (status === "negative") {
    return (
      <svg
        className="mx-auto h-6 w-6 text-muted"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <span className="text-xl font-medium text-muted" aria-hidden="true">
      —
    </span>
  );
}

function RocketIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    </svg>
  );
}

export function AdvantageSection() {
  return (
    <section id="advantage" className="bg-surface-alt py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-accent"
            aria-hidden="true"
          />
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The ImReady Advantage
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            See how our structured journey compares to relying solely on traditional
            internships.
          </p>
        </div>

        <div className="mt-12 hidden overflow-hidden rounded-[var(--radius-card)] border border-border bg-white md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th
                  scope="col"
                  className="bg-surface-alt px-6 py-4 text-left font-semibold text-foreground"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="bg-surface-alt px-6 py-4 text-center font-semibold text-foreground"
                >
                  Traditional Internship
                </th>
                <th
                  scope="col"
                  className="bg-brand-50 px-6 py-4 text-center font-semibold text-brand-700"
                >
                  ImReady Journey
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, index) => (
                <tr
                  key={row.feature}
                  className={cn(index < COMPARISON_ROWS.length - 1 && "border-b border-border")}
                >
                  <td className="px-6 py-5 font-medium text-foreground">{row.feature}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-1 text-muted">
                      <StatusIcon status={row.traditional.status} />
                      {row.traditional.text && (
                        <span className="text-xs">{row.traditional.text}</span>
                      )}
                    </div>
                  </td>
                  <td className="bg-brand-50/60 px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-1 text-brand-700">
                      <StatusIcon status={row.imready.status} />
                      {row.imready.text && (
                        <span className="text-xs font-medium">{row.imready.text}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 space-y-4 md:hidden">
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.feature}
              className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-white"
            >
              <div className="border-b border-border bg-surface px-4 py-3">
                <h3 className="font-semibold text-foreground">{row.feature}</h3>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="px-4 py-5 text-center">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                    Traditional
                  </p>
                  <div className="flex flex-col items-center gap-1 text-sm text-muted">
                    <StatusIcon status={row.traditional.status} />
                    {row.traditional.text && <span>{row.traditional.text}</span>}
                  </div>
                </div>
                <div className="bg-brand-50/60 px-4 py-5 text-center">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-700">
                    ImReady
                  </p>
                  <div className="flex flex-col items-center gap-1 text-sm text-brand-700">
                    <StatusIcon status={row.imready.status} />
                    {row.imready.text && <span>{row.imready.text}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <span
            className="mx-auto mb-4 block h-1 w-10 rounded-full bg-accent"
            aria-hidden="true"
          />
          <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-alt px-6 py-12 sm:px-12 sm:py-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to accelerate your career?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
              Join the next cohort and start building the verified experience that
              top companies are looking for.
            </p>
            <div className="mt-8">
              <Button size="lg" href={ROUTES.signupStep(1)}>
                Start Your Journey
                <RocketIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
