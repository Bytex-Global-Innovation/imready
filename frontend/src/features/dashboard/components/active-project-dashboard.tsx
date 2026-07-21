import { DASHBOARD_USER } from "@/constants/dashboard";
import { CurrentProjectCard } from "./current-project-card";
import { RecentNotificationsCard } from "./recent-notifications-card";
import { StageProgressPath } from "./stage-progress-path";

export function ActiveProjectDashboard() {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Hi, {DASHBOARD_USER.name}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Ready to start your first project journey?
        </p>
      </header>

      <div className="space-y-6">
        <StageProgressPath />
        <CurrentProjectCard />
        <RecentNotificationsCard />
      </div>
    </>
  );
}
