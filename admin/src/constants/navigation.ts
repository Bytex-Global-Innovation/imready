import type { LucideIcon } from "@/components/icons";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Tags,
  ClipboardList,
  ClipboardCheck,
  Target,
  Layers,
  LayoutGrid,
} from "@/components/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           href: "/dashboard",           icon: LayoutDashboard },
  { label: "Students",            href: "/students",            icon: Users           },
  { label: "Projects",            href: "/projects",            icon: FolderKanban    },
  { label: "Project Categories",  href: "/project-categories",  icon: Tags            },
  { label: "Target Domains",      href: "/target-domains",      icon: LayoutGrid      },
  { label: "Assessments",         href: "/assessments",         icon: ClipboardList   },
  { label: "Assessment Results",  href: "/assessment-results",  icon: ClipboardCheck  },
  { label: "Foundation Progress",   href: "/foundation-progress", icon: Target          },
  { label: "Foundation Step",       href: "/foundation-step",     icon: Layers          },
];
