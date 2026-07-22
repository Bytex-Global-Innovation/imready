export const DASHBOARD_USER = {
  name: "Alex Rivers",
  role: "Junior Explorer",
  avatarSrc: "/imready_logo.jpeg",
} as const;

export const JOURNEY_PATH_STEPS = [
  {
    id: "assessment",
    label: "Assessment",
    subtitle: "Foundational",
    status: "active" as const,
  },
  {
    id: "projects",
    label: "Projects",
    subtitle: "Hands-on",
    status: "locked" as const,
  },
  {
    id: "mentorship",
    label: "Mentorship",
    subtitle: "Guidance",
    status: "locked" as const,
  },
  {
    id: "research",
    label: "Research",
    subtitle: "Publishing",
    status: "locked" as const,
  },
  {
    id: "industry",
    label: "Industry",
    subtitle: "Professional",
    status: "locked" as const,
  },
] as const;

export const ASSESSMENT_CHECKLIST = [
  {
    id: "goals",
    label: "Personal Development Goals (5 mins)",
    done: true,
  },
  {
    id: "quiz",
    label: "Core Competency Quiz (15 mins)",
    done: false,
  },
  {
    id: "alignment",
    label: "Career Path Alignment (10 mins)",
    done: false,
  },
] as const;

export const ASSESSMENT_PARTS = [
  { part: "Part 1", title: "Personal Goals", duration: "5 mins" },
  { part: "Part 2", title: "Competency Quiz", duration: "15 mins" },
  { part: "Part 3", title: "Career Alignment", duration: "10 mins" },
] as const;

export const ASSESSMENT_NOTICES = [
  {
    id: "duration",
    icon: "clock" as const,
    text: "Total duration: ~30 minutes. Ensure you have an uninterrupted window for completion.",
    highlight: null,
  },
  {
    id: "wifi",
    icon: "wifi" as const,
    text: "Ensure you have a stable internet connection. Progress may be lost if connectivity is interrupted.",
    highlight: null,
  },
  {
    id: "timeout",
    icon: "warning" as const,
    text: "You cannot pause once the timer starts.",
    highlight: "The session will time out after 40 minutes of inactivity.",
  },
] as const;

export const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    title: "Core Competency: Community Impact",
    prompt:
      "Technology can transform how communities learn and grow. Reflect on local needs you have observed, then answer:",
    question:
      "How would you use technology to improve learning in your community?",
    tips: [
      "Be specific about the tools or platforms you would use",
      "Explain who the target beneficiaries are",
      "Mention a metric of success",
    ],
  },
  {
    id: 2,
    title: "Core Competency: Career Readiness",
    prompt:
      "Stage 0 helps us understand your goals and how you approach challenges. Consider your next two years, then answer:",
    question:
      "What skills do you most want to build, and how will you measure your progress?",
    tips: [
      "Name concrete skills, not vague goals",
      "Describe a realistic practice routine",
      "Include a checkpoint within 30–60 days",
    ],
  },
] as const;

export const INTRO_VIDEO = {
  title: "Introduction Video",
  caption:
    "Learn how to navigate your explorer journey and maximize your potential.",
  duration: "2:45",
  submittedDuration: "6:42",
} as const;

/**
 * ── Active project dashboard (shown after a student applies for a project) ──
 */

export type StageStatus = "completed" | "active" | "locked";

export interface StageProgressStep {
  id: string;
  stageNumber: number;
  label: string;
  subtitle: string;
  caption: string | null;
  status: StageStatus;
}

export const STAGE_PROGRESS_STEPS: StageProgressStep[] = [
  {
    id: "stage-0",
    stageNumber: 0,
    label: "Stage 0",
    subtitle: "Foundations (Passed)",
    caption: null,
    status: "completed",
  },
  {
    id: "stage-1",
    stageNumber: 1,
    label: "Stage 1",
    subtitle: "Projects (Active)",
    caption: "Hands-on projects in your domain",
    status: "active",
  },
  {
    id: "stage-2",
    stageNumber: 2,
    label: "Stage 2",
    subtitle: "Mentorship",
    caption: "Expert guidance session",
    status: "locked",
  },
  {
    id: "stage-3",
    stageNumber: 3,
    label: "Stage 3",
    subtitle: "Industry",
    caption: "Career readiness final prep",
    status: "locked",
    
  },
  {
    id: "stage-4",
    stageNumber: 4,
    label: "Stage 4",
    subtitle: "Research",
    caption: "Paper publication phase",
    status: "locked",
    
  },
];

export interface ActiveProject {
  title: string;
  domain: string;
  progress: number;
  dueDate: string;
  status: string;
}

export const ACTIVE_PROJECT: ActiveProject = {
  title: "AI-Powered Study Assistant",
  domain: "AI/ML",
  progress: 65,
  dueDate: "10 Aug 2025",
  status: "In Progress",
};

export type NotificationIcon = "briefcase" | "check" | "update";

export interface DashboardNotification {
  id: string;
  icon: NotificationIcon;
  title: string;
  description: string;
  time: string;
}

export const RECENT_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "new-project",
    icon: "briefcase",
    title: "New Project Assigned",
    description:
      "You have been assigned a new project in Web Development domain.",
    time: "2h ago",
  },
  {
    id: "assessment-passed",
    icon: "check",
    title: "Assessment Passed",
    description: "Congratulations! You have passed the Stage 0 assessment.",
    time: "1d ago",
  },
  {
    id: "project-update",
    icon: "update",
    title: "Project Update",
    description: "Your project AI Chatbot documentation has been reviewed.",
    time: "2d ago",
  },
];