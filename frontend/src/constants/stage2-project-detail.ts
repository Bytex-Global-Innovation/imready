import { STAGE2_PROJECT_CARDS } from "./stage2-industry-experience";

export const STAGE2_DETAIL_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAGrQYoiEFKi5dL9sdcl8BIBgGARPoqqUwrqZsw3cbBrgcddJ_eoQRgxKbk8PbcpYlhEw63Y4MDCmQvzJy4IiR0x_QS_dtuK1WzY-sr_YoppIXoWCc8RtJQzYSj5cSQCjVu0eGlmokUKs-j5Y5pnvI2gv4GV8ASbSzP-nBqVcf8CrnWEVa9frJiUHlv_toig8BKbP4UpS0rtzS_FPrDd5nwBSEBnt7DbwXn90Rukmq3";

export const STAGE2_CONTRIBUTION_OPTIONS = [
  "Research",
  "Product",
  "Design",
  "Technology",
  "Data",
  "Business",
] as const;

export const STAGE2_APPLY_CONTEXT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB12w4DMjDcnr2et7Hd3A9YkYWg-MyrRDRju7IvzQ9ZWqWIqkZGnZ59QjT9vlS9_OGf8o81jh59heEfl2Lx4_YEJ4oggehZdVnOqdoGZIVdCVVvG2dJBC9Zxbw6sx5GKPrNtoQD45yv4zoLqtv9tG55uaWQ_vz2QC-yM0vYdBxhzR3Jy5tCUdAQpkNz7RvXSXdSA45y43NEteNpMUIbSNde9QFdP_30_zXPTsqdwEgD";

export const STAGE2_CONTRIBUTION_ITEMS: ReadonlyArray<{
  id: (typeof STAGE2_CONTRIBUTION_OPTIONS)[number];
  title: string;
  description: string;
  defaultSelected?: boolean;
}> = [
  { id: "Research", title: "Research", description: "Interviews, user journeys", defaultSelected: true },
  { id: "Product", title: "Product", description: "Roadmap, feature specs", defaultSelected: true },
  { id: "Design", title: "Design", description: "UI prototyping, Figma" },
  { id: "Technology", title: "Technology", description: "Frontend, APIs, tech stack" },
  { id: "Data", title: "Data", description: "Analytics, drop-off stats" },
  { id: "Business", title: "Business", description: "Value proposition, metrics" },
];

export type Stage2ProjectDetail = {
  id: string;
  title: string;
  company: string;
  duration: string;
  teamSize: string;
  teamSizeMin: number;
  teamSizeMax: number;
  featuredLabel: string;
  heroImage: string;
  heroImageAlt: string;
  summary: string;
  categoryPill: string;
  pillTags: readonly string[];
  problemHtml?: boolean;
  problem: string;
  targetUser: string;
  whyMatters: string;
  whatYouDo: string;
  processSteps: readonly string[];
  expectedOutcome: string;
  companyBlurb: string;
  motivationDefault: string;
  whatYouGain: readonly string[];
  cohortStarts: string;
  mentorshipLabel: string;
  teamFormationNote: string;
  applyOpensAt: string | null;
  applyClosesAt: string | null;
  remainingDays: number | null;
  applicationsOpen: boolean;
  applicationsClosed: boolean;
  applicationsNotYetOpen: boolean;
};

const ABC_ONBOARDING_DETAIL: Stage2ProjectDetail = {
  id: "abc-onboarding",
  title: "Improve Student Onboarding",
  company: "ABC Technologies",
  duration: "Up to 30 days",
  teamSize: "2–5 students",
  teamSizeMin: 2,
  teamSizeMax: 5,
  featuredLabel: "Featured",
  heroImage: STAGE2_DETAIL_HERO_IMAGE,
  heroImageAlt:
    "A focused group of diverse university students working collaboratively around a laptop in a modern brightly lit product design lab, discussing wireframes and user journeys, warm corporate natural lighting, deep navy and emerald tones",
  summary:
    "Reduce early friction and dropout during initial student product orientation by identifying cognitive drop points and prototyping a modern activation loop.",
  categoryPill: "Product",
  pillTags: ["Research", "Product", "UX"],
  problemHtml: true,
  problem:
    "New students are dropping off during the onboarding process before completing key steps. Analytics indicate an 42% drop-off rate between account validation and first project cohort enrollment.",
  targetUser:
    "New students using the platform—specifically first-generation learners and non-traditional engineering undergraduates who need clearer visual milestones and instant project qualification status.",
  whyMatters:
    "Higher activation helps students succeed and improves product impact. When students complete onboarding smoothly, their likelihood of reaching Stage 3 paid industry placements multiplies by 3.4x.",
  whatYouDo:
    "Talk to users, understand pain points, identify patterns, design and test a solution.",
  processSteps: [
    "Conduct 5+ student interviews",
    "Synthesize onboarding journey map",
    "Wireframe high-retention flow",
    "Validate concept via user testing",
  ],
  expectedOutcome:
    "A validated solution (prototype or concept) with evidence and recommendations ready for presentation directly to the ABC Technologies product squad.",
  companyBlurb:
    "SaaS Developer Tools & Student Learning Platforms · 2,400+ employees",
  motivationDefault:
    "I'm interested in improving student experience and I want to learn more about product research and design.",
  whatYouGain: [
    "Work on a real product problem",
    "Build industry-relevant skills",
    "Get verified proof of work",
    "Potential opportunity for paid continuation (Stage 3)",
  ],
  cohortStarts: "Next Monday",
  mentorshipLabel: "Verified Industry Partner",
  teamFormationNote: "Submit your interest to form or join an active team.",
  applyOpensAt: null,
  applyClosesAt: null,
  remainingDays: null,
  applicationsOpen: true,
  applicationsClosed: false,
  applicationsNotYetOpen: false,
};

function cardToDetail(
  card: (typeof STAGE2_PROJECT_CARDS)[number],
): Stage2ProjectDetail {
  return {
    id: card.id,
    title: card.title,
    company: card.company,
    duration: card.duration,
    teamSize: card.teamSize,
    teamSizeMin: 2,
    teamSizeMax: 5,
    featuredLabel: card.badge.label,
    heroImage: card.image,
    heroImageAlt: card.imageAlt,
    summary: card.description,
    categoryPill: card.tags[0] ?? "Product",
    pillTags: card.tags,
    problem: card.description,
    targetUser:
      "Students and early-career learners aligned with this challenge domain.",
    whyMatters:
      "Real-world impact for partners and portfolio-grade proof for your Stage 2 journey.",
    whatYouDo:
      "Collaborate with your team to research, design, and validate a solution with mentor guidance.",
    processSteps: [
      "Discovery interviews",
      "Synthesis and journey mapping",
      "Prototype or concept design",
      "Validation with users",
    ],
    expectedOutcome:
      "Documented deliverables and recommendations ready for partner review.",
    companyBlurb: "Industry partner · Verified on ImReady",
    motivationDefault: ABC_ONBOARDING_DETAIL.motivationDefault,
    whatYouGain: ABC_ONBOARDING_DETAIL.whatYouGain,
    cohortStarts: ABC_ONBOARDING_DETAIL.cohortStarts,
    mentorshipLabel: ABC_ONBOARDING_DETAIL.mentorshipLabel,
    teamFormationNote: ABC_ONBOARDING_DETAIL.teamFormationNote,
    applyOpensAt: null,
    applyClosesAt: null,
    remainingDays: null,
    applicationsOpen: true,
    applicationsClosed: false,
    applicationsNotYetOpen: false,
  };
}

const DETAIL_BY_ID: Record<string, Stage2ProjectDetail> = {
  "abc-onboarding": ABC_ONBOARDING_DETAIL,
  "edutech-ai": cardToDetail(STAGE2_PROJECT_CARDS[1]),
  "greentrace-carbon": cardToDetail(STAGE2_PROJECT_CARDS[2]),
};

export function getStage2ProjectDetail(projectId: string): Stage2ProjectDetail | null {
  return DETAIL_BY_ID[projectId] ?? null;
}
