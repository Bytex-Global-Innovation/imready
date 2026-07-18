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
