export const DASHBOARD_USER = {
  name: "Alex Rivers",
  role: "Junior Explorer",
  avatarSrc: "/imready_logo.jpeg",
} as const;

export const JOURNEY_PATH_STEPS = [
  {
    id: "foundation",
    label: "Foundation",
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
    id: "industry",
    label: "Industry",
    subtitle: "Professional",
    status: "locked" as const,
  },
] as const;

/** The 5-step "how it works" list on the Stage 0 dashboard card. */
export type FoundationStepIcon =
  | "calendar"
  | "check"
  | "document"
  | "chart"
  | "star";

export const FOUNDATION_STEPS = [
  {
    id: "lessons",
    step: 1,
    label: "Explore short lessons",
    note: "(10–15 min each)",
    icon: "calendar" as FoundationStepIcon,
  },
  {
    id: "mission",
    step: 2,
    label: "Do a small mission",
    note: null,
    icon: "check" as FoundationStepIcon,
  },
  {
    id: "evidence",
    step: 3,
    label: "Submit your evidence",
    note: null,
    icon: "document" as FoundationStepIcon,
  },
  {
    id: "feedback",
    step: 4,
    label: "Get feedback",
    note: "(AI powered)",
    icon: "chart" as FoundationStepIcon,
  },
  {
    id: "profile",
    step: 5,
    label: "Complete all 5 missions and unlock your Foundation Profile",
    note: null,
    icon: "star" as FoundationStepIcon,
  },
] as const;

export const FOUNDATION_CARD = {
  title: "Your learning journey in 5 simple steps",
  description:
    "Complete the foundational missions to unlock Stage 01, hands-on projects, and your Foundation Profile.",
  callout: "No exams. No marks. Just real work and real feedback.",
  cta: "Start Foundation Stage",
} as const;

/** Instructions modal — 5 micro-missions. */
export const FOUNDATION_PARTS = [
  { part: "Part 1: Reality", title: "Friction Observation", duration: "15 mins" },
  { part: "Part 2: Engage", title: "Conversations", duration: "20 mins" },
  { part: "Part 3: Analyze", title: "The 5 Whys", duration: "20 mins" },
  { part: "Part 4: Do", title: "Build & Test", duration: "30 mins" },
  { part: "Part 5: Your Proof", title: "Show Your Impact", duration: "15 mins" },
] as const;

export const FOUNDATION_INSTRUCTIONS = {
  title: "Stage 0: Foundation Stage Instructions",
  intro:
    "This foundational stage guides you through 5 real-world micro-missions to build and verify your problem-solving capabilities.",
} as const;

export type FoundationNoticeIcon = "clock" | "wifi" | "star";

export const FOUNDATION_NOTICES = [
  {
    id: "duration",
    icon: "clock" as FoundationNoticeIcon,
    segments: [
      {
        text: "Total duration: ~100 minutes. You can complete each mission at your own pace.",
        bold: false,
      },
    ],
  },
  {
    id: "autosave",
    icon: "wifi" as FoundationNoticeIcon,
    segments: [
      {
        text: "Your work auto-saves continuously. You can pause and return anytime.",
        bold: false,
      },
    ],
  },
  {
    id: "proof",
    icon: "star" as FoundationNoticeIcon,
    segments: [
      { text: "Complete all 5 missions to generate your verified ", bold: false },
      { text: "Foundation Profile", bold: true },
      { text: " and ", bold: false },
      { text: "READY Score", bold: true },
      { text: ".", bold: false },
    ],
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
    options: [
      { id: "q1-o3", label: "Share learning resources through an accessible digital platform" },
      { id: "q1-o1", label: "Identify local learning gaps with short community surveys" },
      { id: "q1-o4", label: "Track engagement and improve content based on results" },
      { id: "q1-o2", label: "Train peer mentors to support first-time learners" },
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
    options: [
      { id: "q2-o2", label: "Practice weekly with small, measurable goals" },
      { id: "q2-o4", label: "Review progress every 30 days and adjust your plan" },
      { id: "q2-o1", label: "Choose 1–2 priority skills tied to your career door" },
      { id: "q2-o3", label: "Build a simple portfolio piece that shows those skills" },
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