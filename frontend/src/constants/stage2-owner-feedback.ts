export const OWNER_EVALUATOR_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAtjkM3Pyk2Be6HeLVyGqt211PrFSClVV0tcHODQHobZ24fKk8aSkTeaYROwuCaqjvAL8rINVyBqgWbVPDlU9wRlj-zTgjpuY2PhnNDqh0S6GRRszN-9Zon-QOx5sdgLb6ajdz_mDc66bVSD2G_-cmc4KHKVaCFDHsBDhuEfja23K-ugxBDQ7VE_-L58InbDjmih7CM58pcHKHEXQLQtfTU_PWwo_eV8GDOFJ46smuw";

export const OWNER_EVALUATOR_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBVbZ2wefYpP-jNh8cffR3mo-QonFMvz4YwgiHuZCNDe5tQ2Ms7f-hiOSbqFOlq2K4Wzsk4phWrsmCltmHq1esrdaIvUA8AUGPTaJbfF874n0RhHEWYtB2zNVbGxIHdqanbeBTEMR5cvejrWYr1wV9Fmdo28aN4KttZK9uYAcRmh5t8AR_arYZvFoKKWFMrXYmRjwHogr4-CHHV8zFywcTXPHSNsVeoSeS3gLFsp56E";

export const OWNER_EVALUATOR = {
  name: "Rahul Mehta",
  title: "Product Manager",
  initials: "RM",
} as const;

export type ContinuationDecision =
  | "entire_team"
  | "selected_students"
  | "no_continuation";

export type OwnerFeedbackDraft = {
  workedWell: string;
  improved: string;
  valuable: string;
  overall: string;
  continuation: ContinuationDecision;
  submitted: boolean;
};

export const DEFAULT_OWNER_FEEDBACK: OwnerFeedbackDraft = {
  workedWell:
    "Strong user research and problem definition were evident from Day 1. The team tackled onboarding drop-offs using quantitative student survey data combined with five qualitative deep-dive user sessions.",
  improved:
    "Deeper testing on peripheral mobile viewports. Edge cases such as interrupted sign-up or OAuth timeouts weren’t fully mapped in the primary prototype journey.",
  valuable:
    "Evidence-based approach: The sprint 2 iteration directly addressed the 40% field reduction bottleneck and measurably elevated onboarding completion projection to 72%.",
  overall:
    "Great work! The team demonstrated strong learning, clear thinking and measurable improvement between the two iterations.",
  continuation: "entire_team",
  submitted: false,
};

export const STUDENT_QUOTE =
  "Your second iteration showed significant improvement. Excellent user research and clear evidence of impact.";

export const VALUED_POINTS = [
  "Strong user understanding",
  "Evidence-based approach",
  "Clear improvement in Iteration 2",
  "Well structured final demo",
] as const;

export const IMPROVE_POINTS = [
  "Consider edge cases",
  "Test with a slightly larger user group",
  "Explore long-term engagement metrics",
] as const;

export const CONTINUATION_OPTIONS: readonly {
  value: ContinuationDecision;
  title: string;
  description: string;
}[] = [
  {
    value: "entire_team",
    title: "Continue with the entire team",
    description: "Invite all active members into Stage 3 Paid Industry Engagement.",
  },
  {
    value: "selected_students",
    title: "Continue with selected students (choose specific students)",
    description: "Select specific role standouts based on contributions.",
  },
  {
    value: "no_continuation",
    title: "No continuation at this time",
    description: "Project concludes with Stage 2 verification & credential delivery.",
  },
];

export function ownerFeedbackStorageKey(projectId: string) {
  return `imready-stage2-owner-feedback:${projectId}`;
}
