import Link from "next/link";
import { Briefcase, CheckCircle2, RefreshCw } from "@/components/icons";
import { Card } from "@/components/ui/card";
import {
  RECENT_NOTIFICATIONS,
  type NotificationIcon,
} from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<
  NotificationIcon,
  { icon: typeof Briefcase; iconClass: string; bgClass: string }
> = {
  briefcase: {
    icon: Briefcase,
    iconClass: "text-primary",
    bgClass: "bg-surface",
  },
  check: {
    icon: CheckCircle2,
    iconClass: "text-green-600",
    bgClass: "bg-green-100",
  },
  update: {
    icon: RefreshCw,
    iconClass: "text-purple-600",
    bgClass: "bg-purple-100",
  },
};

export function RecentNotificationsCard() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Recent Notifications
        </p>
        <Link
          href={ROUTES.dashboard}
          className="cursor-pointer text-sm font-semibold text-primary hover:text-primary-hover"
        >
          View all
        </Link>
      </div>

      <ul className="space-y-4">
        {RECENT_NOTIFICATIONS.map((notification) => {
          const { icon: Icon, iconClass, bgClass } = ICON_MAP[notification.icon];
          return (
            <li key={notification.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  bgClass,
                )}
              >
                <Icon className={cn("h-4 w-4", iconClass)} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {notification.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted">
                    {notification.time}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {notification.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-border pt-4 text-center">
        <Link
          href={ROUTES.dashboard}
          className="cursor-pointer text-sm font-semibold text-primary hover:text-primary-hover"
        >
          View all notifications
        </Link>
      </div>
    </Card>
  );
}
