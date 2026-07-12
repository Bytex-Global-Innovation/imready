import type { LucideIcon } from "@/components/icons";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  UserCheck,
  ClipboardList,
} from "@/components/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard },
  { label: "Students",    href: "/students",     icon: Users           },
  { label: "Projects",    href: "/projects",     icon: FolderKanban    },
  { label: "Colleges",    href: "/colleges",     icon: Building2       },
  { label: "Mentors",     href: "/mentors",      icon: UserCheck       },
  { label: "Assessments", href: "/assessments",  icon: ClipboardList   },
];
