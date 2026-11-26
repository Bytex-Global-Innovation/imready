import type { LucideIcon } from "@/components/icons";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Mail,
  Bell,
  Tags,
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

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "People & work",
    items: [
      { label: "Students", href: "/students", icon: Users },
      { label: "Clients", href: "/clients", icon: Building2 },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Applications", href: "/applications", icon: Mail },
      { label: "Stage 2 Reviews", href: "/project-reviews", icon: ClipboardCheck },
    ],
  },
  {
    label: "Inbox",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Project Categories", href: "/project-categories", icon: Tags },
      { label: "Target Domains", href: "/target-domains", icon: LayoutGrid },
    ],
  },
  {
    label: "Foundation",
    items: [
      { label: "Foundation Progress", href: "/foundation-progress", icon: Target },
      { label: "Foundation Step", href: "/foundation-step", icon: Layers },
    ],
  },
];

/** Flat list kept for any consumers that still expect NAV_ITEMS. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
