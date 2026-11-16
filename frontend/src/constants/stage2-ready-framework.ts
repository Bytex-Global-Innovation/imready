export type ReadyPhaseKey = "R" | "E" | "A" | "D" | "Y";

export type ReadyPhaseStatus = "active" | "progress" | "upcoming" | "locked";

export type ReadyTask = {
  id: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
};

export type ReadyEvidenceItem = {
  id: string;
  title: string;
  meta: string;
  imageSrc?: string;
  avatarSrc?: string;
  badge?: string;
};

export type ReadyPhase = {
  key: ReadyPhaseKey;
  name: string;
  subtitle: string;
  stepLabel: string;
  description: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  cta: string;
  evidenceTitle: string;
  evidenceBadge: string;
  tasks: readonly ReadyTask[];
  evidence: readonly ReadyEvidenceItem[];
};

export const READY_PHASES: readonly ReadyPhase[] = [
  {
    key: "R",
    name: "Reality",
    subtitle: "Go see",
    stepLabel: "Step 13 · Execution",
    description: "Understand what actually happens.",
    accent: "#f97316",
    accentSoft: "#ffedd5",
    accentText: "#9a3412",
    cta: "Add an Observation",
    evidenceTitle: "Your Observations",
    evidenceBadge: "Verified Proof",
    tasks: [
      {
        id: "r1",
        label: "Observe at least 5 real examples",
        hint: "(e.g., students going through onboarding).",
        defaultChecked: true,
      },
      {
        id: "r2",
        label: "Note what they do, what confuses them and what they skip.",
        defaultChecked: true,
      },
      {
        id: "r3",
        label: "Take photos, short notes or short videos (with permission).",
        defaultChecked: true,
      },
      {
        id: "r4",
        label: "Capture key observations in your own words.",
      },
    ],
    evidence: [
      {
        id: "obs-1",
        title: "Observed 2 students during sign up flow",
        meta: "Today, 11:20 AM",
        imageSrc:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAuEqbFrs3gm_7MuHtpZwxC3F5djS9soiE6u2uGp-4liX0gmcjHSGb0Gfsb-mRQu8As6viCIMj0zus6G5-zeks2tbzq4QpM72d96KoOLhLY8i8ng0XXdovVeF422m7qrxYRTmw2vmYyqgOStxBEFEC2OG7m3oGKY3b4Zmo1zd9bYS_vAByDSipYD2OhH5ExIDziBmUrYpvZ7ggP8EHKYbPocZkk6p62MMHIoVtAzzhA",
      },
      {
        id: "obs-2",
        title: "Noted confusion at step 3",
        meta: "Yesterday, 4:15 PM",
        imageSrc:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAX5fWpuwu4nlXIttPhAatXrTQFxYMXCYa59Phc_3CRyPCCLlq5bom3AmQ0e73DI7dZagiyqksRr8plkm0UItBXFHEFngpp_MejynaqEoXcQiY4E8ttsVdzncpFpUnZ2v_XOP9w03XRr0RpQOyHxh6q-JejLdteAeZNyp_WPRl2g16wJJ8s3lS_HhsOY4SNbwaXEknNCJda4T2RC_wv7f6weNYuUlPoZzU99v21LTOy",
      },
      {
        id: "obs-3",
        title: "Observed onboarding on mobile",
        meta: "Yesterday, 2:05 PM",
        imageSrc:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC7ulzesI3zrPixV9ulmAGKwJ0yj8HmFLgptLuAVou94Jw_AQPjYjDDM83HvIQQoyl7FPt0zy9ACx2lQCbnfOfQSLpVQpKxHkJ3o4akI9Yur6rt5TWQNkLsNuiXEvWQmeLDJ7q32kqr0SVPaSwTEZodLF4_CsqiVaP29h4PJz9c98g87GjYVcBuFF2wCXgZhUECFJBL0WG9o1lMeTm3-plet0JEL-bIMkOYEkD6Gaw7",
      },
    ],
  },
  {
    key: "E",
    name: "Engage",
    subtitle: "Meet people",
    stepLabel: "Step 14 · Execution",
    description: "Listen to different perspectives.",
    accent: "#ea580c",
    accentSoft: "#ffedd5",
    accentText: "#9a3412",
    cta: "Add a Conversation",
    evidenceTitle: "Your Conversations",
    evidenceBadge: "Real Voices",
    tasks: [
      {
        id: "e1",
        label: "Talk to at least 3–5 people",
        hint: "(e.g., new students, support staff).",
        defaultChecked: true,
      },
      {
        id: "e2",
        label: "Ask open questions about their experience.",
        defaultChecked: true,
      },
      {
        id: "e3",
        label: "Capture quotes and key insights.",
      },
      {
        id: "e4",
        label: "Note what works and what doesn't.",
      },
    ],
    evidence: [
      {
        id: "conv-1",
        title: "“It felt too long. I almost dropped off.”",
        meta: "Student, 1st year, 10:30 AM",
        avatarSrc:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDeVO4w7eS5PfQKdFi7G3ODu9A40K4rwPR7zk888WKECu1g_6Wlcl2DxxAYFa0XX6DWuzGLMl4Gch_dOwkdXbrHw-VTBkWg2YxQ5T-u9LvipDj00gsUK7OfQUfUFGhIjHFkEeVBh1M_iB7BTOQu_lE6IM3JjvmccMTNka-1PWRGBmpeVXlKD0mhXU9n8N5ppnJswxXvvb7cXk2BpDCiWq578RUzo3vx3MlLXOYv83Ba",
      },
      {
        id: "conv-2",
        title: "“I wasn't sure what documents were needed.”",
        meta: "Student, 2nd year, 3:20 PM",
        avatarSrc:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZkLV0kZ2W2Jtn2fWKBWCPM9StNZFF1VRYX1_QCS47saxg966qosqSfzU49FpVJdMRpgj8QyJyVoc1si_tFsjY_pMVN9tmyMekZr0m1aRjcMSSPJIjfP5aG69En8QM2XcXIOeldkYOteOnmKCthOehtBYSTe1_5N5Z_P75a6NTmHjzVwXXbI_EjgnePM0MWEkIAQCyF1TuMoTXxylMlpUcQ4Dy_GbvdPCMxGUGYRa",
      },
    ],
  },
  {
    key: "A",
    name: "Analyze",
    subtitle: "Make sense of evidence",
    stepLabel: "Step 15 · Execution",
    description: "Find patterns. Identify the real problem.",
    accent: "#f59e0b",
    accentSoft: "#fef3c7",
    accentText: "#92400e",
    cta: "Add an Insight",
    evidenceTitle: "Your Insights",
    evidenceBadge: "Synthesized",
    tasks: [
      {
        id: "a1",
        label: "Look at all your observations and conversations.",
        defaultChecked: true,
      },
      {
        id: "a2",
        label: "Find common patterns.",
        defaultChecked: true,
      },
      {
        id: "a3",
        label: "Identify the key problem(s).",
        defaultChecked: true,
      },
      {
        id: "a4",
        label: "Summarize what is really happening.",
      },
    ],
    evidence: [
      {
        id: "ins-1",
        title:
          "Many students drop off at document upload due to unclear requirements.",
        meta: "Synthesized 2h ago",
        badge: "High Impact",
      },
      {
        id: "ins-2",
        title: "Users expect faster guidance and show real-time progress.",
        meta: "Synthesized 4h ago",
        badge: "Pattern Confirmed",
      },
    ],
  },
] as const;

export const READY_STEPPER: ReadonlyArray<{
  key: ReadyPhaseKey;
  name: string;
  subtitle: string;
  status: ReadyPhaseStatus;
  color?: string;
}> = [
  {
    key: "R",
    name: "Reality",
    subtitle: "Go see",
    status: "active",
    color: "#f97316",
  },
  {
    key: "E",
    name: "Engage",
    subtitle: "Meet people",
    status: "active",
    color: "#ea580c",
  },
  {
    key: "A",
    name: "Analyze",
    subtitle: "Make sense",
    status: "progress",
    color: "#f59e0b",
  },
  {
    key: "D",
    name: "Do",
    subtitle: "Build & test",
    status: "upcoming",
  },
  {
    key: "Y",
    name: "Your Proof",
    subtitle: "Show what built",
    status: "locked",
  },
];

export const ITERATION_1_CYCLE = [
  { key: "R", name: "Reality", blurb: "Go see", color: "#ba1a1a" },
  { key: "E", name: "Engage", blurb: "Meet people", color: "#153a75" },
  { key: "A", name: "Analyze", blurb: "Make sense", color: "#3a608d" },
  { key: "D", name: "Do", blurb: "Build & test", color: "#0d3b66" },
  { key: "Y", name: "Your Proof", blurb: "Show what you built", color: "#002e97" },
] as const;

export const ITERATION_2_CYCLE = [
  { key: "R", name: "Reality", blurb: "Revisit", color: "#ba1a1a" },
  { key: "E", name: "Engage", blurb: "Deeper conversations", color: "#153a75" },
  { key: "A", name: "Analyze", blurb: "Deeper decide", color: "#3a608d" },
  { key: "D", name: "Do", blurb: "Improve & test", color: "#0d3b66" },
  { key: "Y", name: "Your Proof", blurb: "Show improved solution", color: "#002e97" },
] as const;

export type DoProofTask = {
  id: string;
  label: string;
  hint: string;
  defaultChecked?: boolean;
};

export const DO_PHASE_TASKS: readonly DoProofTask[] = [
  {
    id: "d1",
    label: "Build a simple prototype (keep it small).",
    hint: "Low-fidelity wireframes or interactive flow for student onboarding.",
    defaultChecked: true,
  },
  {
    id: "d2",
    label: "Test it with real users.",
    hint: "Conducted walkthrough session with freshman cohort participants.",
    defaultChecked: true,
  },
  {
    id: "d3",
    label: "Observe what happens.",
    hint: "Documented screen navigation delays and confusion points.",
    defaultChecked: true,
  },
  {
    id: "d4",
    label: "Note what worked and what didn't.",
    hint: "Finalize takeaways to prepare for Stage Y reflection.",
  },
];

export const PROOF_PHASE_TASKS: readonly DoProofTask[] = [
  {
    id: "y1",
    label: "Show your solution (screens, prototype, documents, or video).",
    hint: "Attach media or interactive Figma walkthrough URLs.",
  },
  {
    id: "y2",
    label: "Summarize what you learned.",
    hint: "Highlight core discoveries about student friction points.",
  },
  {
    id: "y3",
    label: "What worked and what didn't?",
    hint: "Objective review of successes and navigation blockers.",
  },
  {
    id: "y4",
    label: "What will you improve in Iteration 2?",
    hint: "Actionable roadmap for Weeks 3–4 refine stage.",
  },
];

export const DO_TEST_SAMPLE = {
  id: "test-1",
  badge: "Usability Test Run",
  title: "Tested simplified document upload flow with 4 students",
  meta: "Today, 5:10 PM",
  participants: "4 participants",
  imageSrc:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBQs-JWIs8rotQhatwmiA0CSXX48SKaev46XXSHgu4RgvYyRhM4pSPCLWiAkHtKe0CfO-P12aVXqB6DxLzpKb8gaRfrLGiGtFr3yGSBsUuVlf06pgneAXm_B74sheJKWVFYqjOy-ktMGVX5TUUpYjLRPnj8uH7N5gmY4h7ZNk6Sb6qE__36MVHaWp1bbi_PM0bmThgC9pC0CKLD0rqcfdSZ3h6YRmIrAGVTDupYxjMF",
} as const;

export const PROOF_TEMPLATE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwF381tSoBPbAu_l7MXpHWNJ0tYWRPX8qzVv0coG0DC05EHF2YdLhXMLTpUMcsOAJmOC-h1ytOXrRXX6B3t7kGbZZLRAGLDrtCFU77qBQLRR-uJQnSmrpo8lEtpq_bVx3hKV6AhoqhdKiBnlHasAn6jI1Bd3q2xPwFe6JlDJ4Fe1Z5OvjIAMYK4eZ15u0i2eg8SwDjxlHZbOeZcOrjqArBrm9o23ZaF1JmpytJoIki";
