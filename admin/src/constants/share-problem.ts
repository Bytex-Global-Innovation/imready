export const INVOLVEMENT_OPTIONS = [
  { id: "students", label: "Students do it fully" },
  { id: "share", label: "I'll share inputs, students figure out the rest" },
  { id: "skip", label: "Skip, students shouldn't focus on this" },
] as const;

export const EFFORT_OPTIONS = [
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "deep", label: "Deep" },
] as const;

export type InvolvementId = (typeof INVOLVEMENT_OPTIONS)[number]["id"];
export type EffortId = (typeof EFFORT_OPTIONS)[number]["id"];

export const READY_PHASES = [
  {
    id: "reality",
    name: "Understand the problem",
    detail: "What is actually going on, and who it affects",
    involvement: "share" as InvolvementId,
    effort: "moderate" as EffortId,
  },
  {
    id: "engage",
    name: "User research",
    detail: "Talk to the people who have the problem",
    involvement: "share" as InvolvementId,
    effort: "moderate" as EffortId,
  },
  {
    id: "analyze",
    name: "Analyze & plan",
    detail: "Research, options, and what is worth building",
    involvement: "students" as InvolvementId,
    effort: "moderate" as EffortId,
  },
  {
    id: "do",
    name: "Build",
    detail: "Make the working demo",
    involvement: "students" as InvolvementId,
    effort: "deep" as EffortId,
  },
  {
    id: "proof",
    name: "Proof & handover",
    detail: "Show the results and hand the demo over",
    involvement: "students" as InvolvementId,
    effort: "moderate" as EffortId,
  },
] as const;

export const PROJECT_TYPE_GROUPS = [
  {
    id: "build-new",
    label: "Build something new",
    options: [
      {
        id: "mvp",
        label: "Raw idea to working product / MVP (web or mobile)",
      },
      {
        id: "ui-prototype",
        label: "UI/UX design or clickable prototype",
      },
      {
        id: "web-store",
        label:
          "Website, portfolio, landing page or online store, incl. hosting",
      },
    ],
  },
  {
    id: "ai-data",
    label: "AI & data",
    options: [
      {
        id: "ai-agent",
        label:
          "AI feature, AI agent or chatbot (new, or take an existing AI build to production)",
      },
      {
        id: "data-tools",
        label: "Data tools: annotation, cleaning, scraping or migration",
      },
      {
        id: "dashboards",
        label: "Dashboards, analytics, or automated reports & documents",
      },
    ],
  },
  {
    id: "run-business",
    label: "Run the business better",
    options: [
      {
        id: "workflow",
        label:
          "Workflow automation & tool integrations (WhatsApp, email, sheets, CRM, APIs)",
      },
      {
        id: "internal-tool",
        label: "Internal tool, admin panel or spreadsheet-to-app",
      },
    ],
  },
  {
    id: "improve-existing",
    label: "Improve what exists",
    options: [
      {
        id: "improve-product",
        label:
          "Add features, testing/QA automation or cloud setup for an existing product",
      },
      {
        id: "validate-idea",
        label: "Validate an idea before building (user research, market check)",
      },
    ],
  },
] as const;

export const PROJECT_TYPE_OTHER = "other" as const;

export const BLOCKERS = [
  { id: "no-time", label: "No time" },
  { id: "no-tech-team", label: "No tech team" },
  { id: "no-agency-budget", label: "No budget for an agency" },
  { id: "unsure-idea", label: "Unsure if the idea works" },
  { id: "tried-failed", label: "Tried before and failed" },
  { id: "other", label: "Other" },
] as const;

export type PhaseState = {
  involvement: InvolvementId;
  effort: EffortId;
};

export type ShareProblemFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  paymentReference: string;
  problem: string;
  ideaStage: "" | "rough" | "defined";
  projectTypes: string[];
  projectTypeOther: string;
  blocker: string;
  blockerOther: string;
  phases: Record<string, PhaseState>;
};

export function emptyShareProblemForm(): ShareProblemFormState {
  const phases: Record<string, PhaseState> = {};
  for (const phase of READY_PHASES) {
    phases[phase.id] = {
      involvement: phase.involvement,
      effort: phase.effort,
    };
  }
  return {
    name: "",
    company: "",
    email: "",
    phone: "",
    paymentReference: "",
    problem: "",
    ideaStage: "",
    projectTypes: [],
    projectTypeOther: "",
    blocker: "",
    blockerOther: "",
    phases,
  };
}

export type ShareProblemErrors = Partial<
  Record<keyof ShareProblemFormState, string>
>;

export function validateShareProblem(
  form: ShareProblemFormState
): ShareProblemErrors {
  const errors: ShareProblemErrors = {};

  if (form.name.trim().length < 2) errors.name = "Enter your name.";
  if (form.company.trim().length < 2) {
    errors.company = "Enter your company or studio.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  const phoneDigits = form.phone.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    errors.phone = "Enter a phone or WhatsApp number.";
  }

  const utr = form.paymentReference.trim();
  if (utr.length < 4) {
    errors.paymentReference = "Enter the UPI transaction ID (UTR).";
  } else if (utr.length > 64 || !/^[\w ./_-]+$/.test(utr)) {
    errors.paymentReference =
      "Use the ID from your UPI app, up to 64 characters.";
  }

  const problem = form.problem.trim();
  if (problem.length < 15) {
    errors.problem = "Describe the problem in a sentence or two.";
  } else if (problem.length > 5000) {
    errors.problem =
      "Please keep this under 5,000 characters. The kickoff is the place for the full brief.";
  }

  if (form.ideaStage !== "rough" && form.ideaStage !== "defined") {
    errors.ideaStage =
      "Say whether this is a rough idea or a defined problem.";
  }

  if (form.projectTypes.length === 0) {
    errors.projectTypes = "Choose at least one project type.";
  }
  if (
    form.projectTypes.includes(PROJECT_TYPE_OTHER) &&
    form.projectTypeOther.trim().length < 2
  ) {
    errors.projectTypeOther = "Tell us the other project type.";
  }

  if (!form.blocker) {
    errors.blocker = "Choose the biggest blocker today.";
  }
  if (form.blocker === "other" && form.blockerOther.trim().length < 2) {
    errors.blockerOther = "Tell us the blocker.";
  }

  return errors;
}

function projectTypeLabel(id: string) {
  if (id === PROJECT_TYPE_OTHER) return "Other";
  for (const group of PROJECT_TYPE_GROUPS) {
    const found = group.options.find((option) => option.id === id);
    if (found) return found.label;
  }
  return id;
}

function blockerLabel(id: string) {
  return BLOCKERS.find((item) => item.id === id)?.label ?? id;
}

function involvementLabel(id: InvolvementId) {
  return INVOLVEMENT_OPTIONS.find((item) => item.id === id)?.label ?? id;
}

function effortLabel(id: EffortId) {
  return EFFORT_OPTIONS.find((item) => item.id === id)?.label ?? id;
}

export function buildShareProblemMessage(form: ShareProblemFormState) {
  const types = form.projectTypes
    .filter((id) => id !== PROJECT_TYPE_OTHER)
    .map(projectTypeLabel);
  const other = form.projectTypes.includes(PROJECT_TYPE_OTHER)
    ? form.projectTypeOther.trim()
    : "";

  return [
    "ImReady — problem shared after paying the reservation fee",
    "",
    `Name: ${form.name.trim()}`,
    `Company: ${form.company.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone / WhatsApp: ${form.phone.trim()}`,
    `UPI transaction ID (UTR): ${form.paymentReference.trim()}`,
    `Rough idea or defined problem: ${
      form.ideaStage === "rough"
        ? "Rough idea"
        : form.ideaStage === "defined"
          ? "Defined problem"
          : ""
    }`,
    `Biggest blocker today: ${blockerLabel(form.blocker)}${
      form.blocker === "other" ? ` — ${form.blockerOther.trim()}` : ""
    }`,
    "",
    "Project types:",
    ...types.map((label) => `- ${label}`),
    ...(other ? [`- Other: ${other}`] : []),
    "",
    "How you want the teams to work:",
    ...READY_PHASES.map((phase) => {
      const state = form.phases[phase.id];
      const effort =
        state.involvement === "skip"
          ? ""
          : `. Effort: ${effortLabel(state.effort)}`;
      return `- ${phase.name}: ${involvementLabel(state.involvement)}${effort}`;
    }),
    "",
    "Problem:",
    form.problem.trim(),
  ].join("\n");
}
