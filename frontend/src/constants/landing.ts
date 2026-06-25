export const PLATFORM_STATS = [
  { value: "372+", label: "Students Onboarded" },
  { value: "38+", label: "Industry Projects" },
  { value: "23+", label: "Partner Colleges" },
] as const;

export const JOURNEY_STAGES = [
  {
    step: 1,
    title: "College Learning",
    description: "Build strong fundamentals through academic learning.",
    icon: "book",
  },
  {
    step: 2,
    title: "Real Project",
    description: "Work on real industry problems and build practical solutions.",
    icon: "code",
  },
  {
    step: 3,
    title: "Mentor Review",
    description: "Get feedback and guidance from industry experts.",
    icon: "mentor",
  },
  {
    step: 4,
    title: "Portfolio Building",
    description: "Create a professional portfolio that showcases your best work.",
    icon: "folder",
  },
  {
    step: 5,
    title: "Placement Ready",
    description:
      "Gain the confidence and experience to land internships and full-time roles.",
    icon: "placement",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Apply",
    description:
      "Choose your area of interest, share contact details, and verify your student profile in minutes.",
  },
  {
    step: "02",
    title: "Get an assignment",
    description:
      "Receive your first real industry brief — the entry test for Stage 1 of the journey.",
  },
  {
    step: "03",
    title: "Submit & get evaluated",
    description:
      "Turn in your work and get a clear pass or fail from real industry reviewers.",
  },
  {
    step: "04",
    title: "Unlock your stage",
    description:
      "Pass, and Stage 1 unlocks — along with every project available at that level.",
  },
] as const;

export const WHY_CHOOSE_FEATURES = [
  {
    title: "Real Industry Projects",
    description:
      "Work on actual business problems inspired by industry use cases. Build solutions that demonstrate practical skills beyond classroom assignments.",
    icon: "briefcase",
  },
  {
    title: "Expert Mentor Guidance",
    description:
      "Receive continuous feedback from working professionals who understand industry expectations. Learn how real teams think, build, and deliver.",
    icon: "mentor",
  },
  {
    title: "Portfolio That Speaks",
    description:
      "Every completed stage strengthens your professional portfolio with verified project evidence. Show recruiters what you can do, not just what you know.",
    icon: "portfolio",
  },
  {
    title: "Structured Growth Path",
    description:
      "Progress through a clear 5-stage framework from Emerging to Distinguished. Know exactly where you stand and what comes next.",
    icon: "growth-path",
  },
  {
    title: "Industry Validation",
    description:
      "Get evaluated against real-world standards instead of academic grading alone. Earn credibility that recruiters can trust.",
    icon: "shield",
  },
  {
    title: "Career Readiness",
    description:
      "Develop communication, teamwork, execution, and problem-solving skills alongside technical expertise. Be prepared before placement season begins.",
    icon: "career",
  },
] as const;

export const COMPARISON_ROWS = [
  {
    feature: "Dedicated Mentorship",
    traditional: { status: "negative" as const, text: "Often hit-or-miss" },
    imready: { status: "positive" as const, text: "Guaranteed expert guidance" },
  },
  {
    feature: "Work on Real Projects",
    traditional: { status: "neutral" as const, text: "Sometimes busywork" },
    imready: { status: "positive" as const, text: "100% core business tasks" },
  },
  {
    feature: "Verified Portfolio Output",
    traditional: { status: "negative" as const, text: null },
    imready: { status: "positive" as const, text: null },
  },
  {
    feature: "Structured Career Documentation",
    traditional: { status: "negative" as const, text: null },
    imready: { status: "positive" as const, text: null },
  },
] as const;
