import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  FileUp,
  GraduationCap,
  LayoutDashboard,
  Link,
  Settings,
  ShoppingCart,
  Trophy,
  Webhook,
} from "lucide-react";

export type DashboardNavId =
  | "projects"
  | "submit"
  | "overview"
  | "mentorship"
  | "achievements"
  | "settings";

export interface DashboardNavItem {
  id: DashboardNavId;
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardStudent {
  name: string;
  subtitle: string;
  category: string;
  avatarInitials: string;
}

export interface DashboardProject {
  id: string;
  title: string;
  description: string;
  stage: string;
  duration: string;
  icon: LucideIcon;
  ctaLabel: string;
  ctaVariant: "primary" | "secondary";
  canApply: boolean;
}

export interface ProjectBriefMeta {
  estimatedTime: string;
  level: string;
  discipline: string;
}

export interface ProjectBriefDeliverable {
  label: string;
  icon: LucideIcon;
}

export interface ProjectBriefCriterion {
  title: string;
  weight: string;
}

export interface ProjectBriefResource {
  label: string;
  href: string;
}

export interface ProjectBrief {
  projectId: string;
  title: string;
  subtitle: string;
  meta: ProjectBriefMeta;
  overview: string;
  requirements: string[];
  deliverables: ProjectBriefDeliverable[];
  criteria: ProjectBriefCriterion[];
  resources: ProjectBriefResource[];
}

export const DASHBOARD_COPY = {
  sidebarHeading: "My Dashboard",
  projectsPageTitle: "Available Projects",
  projectsPageSubtitle: "Select a real-world scenario to begin your next stage.",
  downloadBrief: "Download",
  startProject: "Start Project",
  overview: "Overview",
  requirements: "Requirements",
  deliverables: "Deliverables",
  evaluationCriteria: "Evaluation Criteria",
  resources: "Resources",
  projectsBreadcrumb: "Projects",
  openMenu: "Open dashboard menu",
  closeMenu: "Close dashboard menu",
  viewProject: "View",
  stageLockedMessage: "Complete Stage 1 to apply for this project.",
} as const;

export const MOCK_STUDENT: DashboardStudent = {
  name: "Alex Chen",
  subtitle: "Stage 1 Student",
  category: "Web Development",
  avatarInitials: "AC",
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { id: "projects", label: "Projects", href: "/dashboard", icon: Briefcase },
  { id: "submit", label: "Submit Projects", href: "/dashboard/submit", icon: FileUp },
  { id: "overview", label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { id: "mentorship", label: "Mentorship", href: "/dashboard/mentorship", icon: GraduationCap },
  { id: "achievements", label: "Achievements", href: "/dashboard/achievements", icon: Trophy },
];

export const DASHBOARD_SETTINGS_NAV: DashboardNavItem = {
  id: "settings",
  label: "Settings",
  href: "/dashboard/settings",
  icon: Settings,
};

export const DASHBOARD_PROJECTS: DashboardProject[] = [
  {
    id: "e-commerce-redesign",
    title: "E-commerce Redesign",
    description:
      "Design a modern, accessible checkout flow for a fictional retail brand. Focus on reducing cart abandonment through intuitive UX patterns.",
    stage: "Stage 1",
    duration: "2 Weeks",
    icon: ShoppingCart,
    ctaLabel: "Apply Now",
    ctaVariant: "primary",
    canApply: true,
  },
  {
    id: "payment-api-integration",
    title: "Payment API Integration",
    description:
      "Build a secure payment gateway integration using REST APIs. Implement error handling, webhooks, and transaction logging.",
    stage: "Stage 2",
    duration: "3 Weeks",
    icon: Webhook,
    ctaLabel: "View",
    ctaVariant: "secondary",
    canApply: false,
  },
];

const DEFAULT_BRIEF_BODY = {
  overview:
    "This project brief will be available once you unlock the previous stage. Complete your current stage projects to access full requirements, deliverables, and evaluation criteria.",
  requirements: [
    "Complete all prior stage projects",
    "Maintain a portfolio of submitted work",
    "Meet minimum assessment scores",
  ],
  deliverables: [
    { label: "Project submission link", icon: Link },
    { label: "Reflection document (PDF)", icon: FileText },
  ],
  criteria: [
    { title: "Technical Quality", weight: "40%" },
    { title: "Documentation", weight: "30%" },
    { title: "Timeliness", weight: "20%" },
    { title: "Collaboration", weight: "10%" },
  ],
  resources: [
    { label: "Stage guidelines (PDF)", href: "#" },
    { label: "Mentor office hours calendar", href: "#" },
  ],
};

export const PROJECT_BRIEFS: Record<string, ProjectBrief> = {
  "e-commerce-redesign": {
    projectId: "e-commerce-redesign",
    title: "E-commerce Redesign — Project Brief",
    subtitle:
      "Design a modern, accessible checkout flow for a fictional retail brand.",
    meta: {
      estimatedTime: "4–6 hours",
      level: "Intermediate Level",
      discipline: "UX/UI Design",
    },
    overview:
      "Your goal is to redesign the checkout experience for 'Aura Tech', a mid-sized electronics retailer. The current checkout has a 68% cart abandonment rate. Analyze user pain points and propose a streamlined, trustworthy flow that reduces friction while maintaining security best practices.",
    requirements: [
      "Responsive design for mobile, tablet, and desktop viewports",
      "Guest checkout option with optional account creation",
      "Clear progress indication across checkout steps",
      "Accessibility compliance (WCAG 2.1 AA minimum)",
      "Trust signals: security badges, return policy, support contact",
    ],
    deliverables: [
      { label: "Figma Prototype Link", icon: Link },
      { label: "Design Rationale Document (PDF)", icon: FileText },
    ],
    criteria: [
      { title: "Usability", weight: "40%" },
      { title: "Visual Design", weight: "30%" },
      { title: "Problem Solving", weight: "20%" },
      { title: "Accessibility", weight: "10%" },
    ],
    resources: [
      {
        label: "Aura Tech Brand Assets (Figma)",
        href: "#",
      },
      {
        label: "Baymard Institute: Checkout Best Practices",
        href: "#",
      },
    ],
  },
  "payment-api-integration": {
    projectId: "payment-api-integration",
    title: "Payment API Integration — Project Brief",
    subtitle: "Build a secure payment gateway integration using REST APIs.",
    meta: {
      estimatedTime: "6–8 hours",
      level: "Advanced Level",
      discipline: "Backend Development",
    },
    ...DEFAULT_BRIEF_BODY,
  },
};

export function getDashboardProjectById(id: string): DashboardProject | undefined {
  return DASHBOARD_PROJECTS.find((project) => project.id === id);
}

export function getProjectBriefById(id: string): ProjectBrief | undefined {
  return PROJECT_BRIEFS[id];
}
