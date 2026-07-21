import { ArrowRight, FolderOpen } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ACTIVE_PROJECT } from "@/constants/dashboard";

export function CurrentProjectCard() {
  return (
    <Card className="p-5 sm:p-6">
      <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        Current Project Status
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-surface">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                {ACTIVE_PROJECT.title}
              </h3>
              <Badge className="bg-green-100 text-green-700">
                {ACTIVE_PROJECT.status}
              </Badge>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                  Domain
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {ACTIVE_PROJECT.domain}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                  Progress
                </dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {ACTIVE_PROJECT.progress}%
                  </span>
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-brand-100">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${ACTIVE_PROJECT.progress}%` }}
                    />
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                  Due Date
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {ACTIVE_PROJECT.dueDate}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center border-t border-border pt-5">
        <Button>
          View Project
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
