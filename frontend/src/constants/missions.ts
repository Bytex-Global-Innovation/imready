export type MissionLetter = "R" | "E" | "A" | "D" | "Y";

export interface MissionMeta {
  id: number;
  letter: MissionLetter;
  letterWord: string;
  title: string;
  subtitle: string;
  activeBadgeLabel: string;
  frameworkPhaseLabel: string | null;
  estTime: string;
  target: string;
  location: string | null;
  xpReward: number;
  tip: { advisorLabel: string; quote: string };
  whatYoullDo: string[];
}

export const MISSIONS: MissionMeta[] = [
  {
    id: 1,
    letter: "R",
    letterWord: "Reality",
    title: "Mission 1: Find a Moment of Friction",
    subtitle:
      "Look for a moment where someone gets frustrated, waits, repeats something, gets confused, or asks for help.",
    activeBadgeLabel: "Active Mission: Reality",
    frameworkPhaseLabel: null,
    estTime: "~15 minutes",
    target: "1 friction observation + evidence doc",
    location: "Anywhere on campus (or nearby)",
    xpReward: 50,
    tip: {
      advisorLabel: "Advisor",
      quote:
        "Don't just describe. Try to notice behaviour, emotions, and patterns. Look for what people actually do vs what they say.",
    },
    whatYoullDo: [
      "Spot one real moment of friction on campus.",
      "Upload an evidence document with Google Drive links.",
      "Write 2–3 lines on what surprised you.",
    ],
  },
  {
    id: 2,
    letter: "E",
    letterWord: "Engage",
    title: "Mission 2: Talk to People",
    subtitle: "Have real conversations. Listen to understand, not to get fast answers.",
    activeBadgeLabel: "Active Mission: Engage",
    frameworkPhaseLabel: null,
    estTime: "~20 min",
    target: "2–3 Chats",
    location: null,
    xpReward: 75,
    tip: {
      advisorLabel: "Advisor",
      quote: "People often say one thing, but do another. Look for stories, not opinions.",
    },
    whatYoullDo: [
      "Talk directly with 2–3 students or staff experiencing the delay.",
      'Ask open exploratory questions (e.g. "How does this wait alter your routine?").',
      "Upload a document with conversation notes and Google Drive links.",
    ],
  },
  {
    id: 3,
    letter: "A",
    letterWord: "Analyze",
   title: "Mission 3: Analyze What You Found",
    subtitle: "Look for patterns. Drill down to the root problem using structured analytical tools.",
    activeBadgeLabel: "Active Mission: A • Analyze",
    frameworkPhaseLabel: null,
    estTime: "~20 minutes",
    target: "1 Prototype Brief",
    location: null,
    xpReward: 75,
    tip: {
      advisorLabel: "Cognitive Momentum Guide",
      quote:
        "Don't just collect information. Connect the dots. The first answer is almost never the real root cause — keep asking why until you see an actionable lever.",
    },
    whatYoullDo: [
      "Review your Mission 1 & 2 observations.",
      "Run the 5 Whys framework to find the root cause.",
      "Tag the pattern you found across conversations.",
    ],
  },
  {
    id: 4,
    letter: "D",
    letterWord: "Do",
    title: "Mission 4: Build, Test and Improve",
    subtitle: "Create a simple prototype and test it in the real world. Keep it small, fast, and testable.",
    activeBadgeLabel: "Active Mission: Do",
    frameworkPhaseLabel: null,
    estTime: "~30 minutes",
    target: "1 tested prototype",
    location: "Campus Canteen",
    xpReward: 75,
    tip: {
  advisorLabel: "Prototyping Coach",
  quote:
    "Don't build a full app. Test a small idea quickly using a simple prototype—even a Google Form or WhatsApp group can work. Good prototypes answer one specific question without premature polish.",
},
    whatYoullDo: [
      "Build a small, fast, testable prototype.",
      "Test it with 2–3 real users on location.",
      "Document what worked, what didn't, and one improvement.",
    ],
  },
  {
    id: 5,
    letter: "Y",
    letterWord: "Your Proof",
    title: "Mission 5: Show Your Impact",
    subtitle: "Package the proof that your fix actually helped, and show who it helped.",
    activeBadgeLabel: "Active Mission: Your Proof",
    frameworkPhaseLabel: "Stage Y: Proof",
    estTime: "~15 minutes",
    target: "1 validated proof",
    location: null,
    xpReward: 100,
    tip: {
      advisorLabel: "Impact Advisor",
      quote:
        "Numbers convince more than adjectives. Say how many people you checked back with and what changed for them.",
    },
    whatYoullDo: [
      "Package your strongest evidence into one proof.",
      "Get 2–3 people to confirm the fix worked for them.",
      "Submit your final write-up for your Foundation Profile.",
    ],
  },
];

export function getMission(id: number): MissionMeta {
  const mission = MISSIONS.find((m) => m.id === id);
  if (!mission) throw new Error(`Unknown mission id: ${id}`);
  return mission;
}

export const READY_SCORE_LABELS: Record<MissionLetter, { label: string; color: string }> = {
  R: { label: "Reality", color: "bg-emerald-500" },
  E: { label: "Engage", color: "bg-sky-500" },
  A: { label: "Analyze", color: "bg-violet-500" },
  D: { label: "Do", color: "bg-orange-500" },
  Y: { label: "Your Proof", color: "bg-amber-500" },
};

export interface MissionCompleteContent {
  celebrationLine: string;
  coachQuote: string;
  evidenceLabel: string;
  insightLabel: string;
  getRecap: (answers: Record<string, unknown>) => { evidence: string; insight: string };
}

export const MISSION_COMPLETE_CONTENT: Record<number, MissionCompleteContent> = {
  1: {
    celebrationLine: "You found a real moment of friction.",
    coachQuote:
      "Great observation! You captured real-world friction and identified clear emotional cues in the waiting pattern.",
    evidenceLabel: "Field Observation",
    insightLabel: "Core Friction Insight",
    getRecap: (a) => ({
      evidence: (a.caption as string) || "—",
      insight: (a.reflection as string) || "—",
    }),
  },
  2: {
    celebrationLine: "You listened first — and it showed.",
    coachQuote:
      "Strong listening. You captured verbatim language instead of your own interpretation — that's the raw material good solutions come from.",
    evidenceLabel: "Conversation Notes",
    insightLabel: "Key Insight",
    getRecap: (a) => ({
      evidence: (a.observation as string) || "—",
      insight: (a.patterns as string) || "—",
    }),
  },
  3: {
    celebrationLine: "You found the real root cause.",
    coachQuote:
      "Solid diagnosis. You didn't stop at the first excuse — you kept asking why until you hit something you can actually fix.",
    evidenceLabel: "Root Cause",
    insightLabel: "Pattern Detected",
    getRecap: (a) => ({
      evidence: (a.rootCause as string) || "—",
      insight: (a.pattern as string) || "—",
    }),
  },
  4: {
    celebrationLine: "You turned an idea into something people could touch.",
    coachQuote:
      "Real prototype, real users, real feedback. That's the loop that separates builders from dreamers.",
    evidenceLabel: "Prototype",
    insightLabel: "Test Takeaway",
    getRecap: (a) => ({
      evidence: (a.description as string) || "—",
      insight: (a.improve as string) || "—",
    }),
  },
};