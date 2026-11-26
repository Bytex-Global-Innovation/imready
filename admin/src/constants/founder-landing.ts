export const SITE = {
  name: "ImReady",
  linkedIn: "https://www.linkedin.com/company/imready-in/",
  tagline: "A working demo of your problem in 2–3 weeks",
  description:
    "Up to three student teams each ship a working demo of one problem in 2–3 weeks. For founders.",
  reservationFee: "₹449",
  reservationAmount: "449",
  batchLabel: "Batch 1: only 10 founder projects",
  privacyNote:
    "We only use form details to contact you about your problem.",
  /** Set a real email when ready (values containing TODO are treated as unset). */
  contactEmail: process.env.NEXT_PUBLIC_LANDING_CONTACT_EMAIL || "TODO_CONTACT_EMAIL",
  whatsappNumber: process.env.NEXT_PUBLIC_LANDING_WHATSAPP || "919370756768",
  upiId: process.env.NEXT_PUBLIC_LANDING_UPI_ID || "9168605001@hdfc",
  upiPayeeName: process.env.NEXT_PUBLIC_LANDING_UPI_NAME || "Navah & Co",
  paymentLink: process.env.NEXT_PUBLIC_LANDING_PAYMENT_LINK || "TODO_PAYMENT_LINK",
  formEndpoint: process.env.NEXT_PUBLIC_LANDING_FORM_ENDPOINT || "",
  shareProblemHash: "share-problem",
} as const;

export const REFUND_COPY =
  "Fully refundable if your problem isn't a fit for us, or if no team ships a demo. Non-refundable once demos are delivered." as const;

export function isConfigured(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.toUpperCase().includes("TODO");
}

export function buildUpiUri() {
  if (!isConfigured(SITE.upiId)) return null;
  const params = new URLSearchParams({
    pa: SITE.upiId.trim(),
    pn: isConfigured(SITE.upiPayeeName) ? SITE.upiPayeeName.trim() : "ImReady",
    am: SITE.reservationAmount,
    cu: "INR",
    tn: "ImReady reservation fee",
  });
  return `upi://pay?${params.toString()}`;
}

export function upiQrImageUrl(size = 180) {
  const uri = buildUpiUri();
  if (!uri) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(uri)}`;
}

export function whatsappUrl(message?: string) {
  if (!isConfigured(SITE.whatsappNumber)) return null;
  const digits = SITE.whatsappNumber.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  const text =
    message ??
    "Hello, I have a question before reserving an ImReady demo project.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function contactEmail() {
  if (!isConfigured(SITE.contactEmail)) return null;
  const email = SITE.contactEmail.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/** Mailto for share-problem submit when a contact inbox is configured. */
export function shareProblemMailto(message: string) {
  const email = contactEmail();
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(
    "ImReady — a problem to scope"
  )}&body=${encodeURIComponent(message)}`;
}

export function paymentPageUrl() {
  if (!isConfigured(SITE.paymentLink)) return null;
  try {
    const url = new URL(SITE.paymentLink.trim());
    if (url.protocol === "https:") return url.toString();
    return null;
  } catch {
    return null;
  }
}

export const NAV_LINKS = [
  { href: "#why", label: "Why" },
  { href: "#how", label: "How it works" },
  { href: "#fit", label: "Who it's for" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "Questions" },
] as const;

export const HERO = {
  eyebrow: "For founders",
  title: "A working demo in 2–3 weeks.",
  body: "Up to three trained student teams each turn your problem into a working demo. You pick the best one, then decide whether to continue the build.",
  note: "Every team is made up of engineering students we screen before they start on your project.",
  refund:
    "Fully refundable if your problem isn't a fit for us, or if no team ships a demo. Non-refundable once demos are delivered.",
} as const;

export const TERMS = [
  ["First", "Pay ₹449 to reserve"],
  ["Then", "Share your problem"],
  ["Kickoff", "30 minutes, we scope it"],
  ["Teams", "Up to 3"],
  ["They ship", "A working demo each"],
  ["Time", "2–3 weeks"],
  ["Review", "Pick a team, or stop there"],
  ["After demos", "Fixed quote, no hourly billing"],
] as const;

export const PROMISE_CHIPS = [
  "Refund if it's not a fit, or no demo ships",
  "The demo you pick is yours",
  "NDA on request",
  "No commitment after demos",
  "GST invoice",
] as const;

export const PROMISE_DETAILS = [
  "Your ₹449 is fully refundable if your problem isn't a fit for us, or if no team ships a demo. We decide fit at the 30-minute kickoff, before any team starts building. Once demos are delivered, the fee is non-refundable.",
  "The demo you pick, and everything built after it, is yours. Demos you don't pick stay with the teams that made them.",
  "We sign an NDA on request. For the demo stage, we recommend using sample or dummy data.",
  "After the demos, you decide whether to continue, and you keep the insights and feedback from the teams.",
  "You receive a GST invoice, so you can claim input credit.",
] as const;

export const WHY_ITEMS = [
  {
    title: "Working demos at marginal cost",
    body: "The ₹449 reservation fee reserves the work. Up to three teams each ship a working demo. You see every demo before deciding anything else.",
  },
  {
    title: "Test the team before you invest in the build",
    body: "See how a team actually works before you commit more time or money to the build.",
  },
  {
    title:
      "Experiment with innovative ideas without pulling your team off core work",
    body: "The student teams take the experiment. Your people stay on the work that already runs the business.",
  },
  {
    title: "Compare different approaches side by side",
    body: "Each team tries the problem its own way. You look at the demos together and continue the build with the one you pick.",
  },
] as const;

export const HOW_STEPS = [
  "Reserve your spot with the ₹449 reservation fee.",
  "Share your problem.",
  "30-min kickoff where ImReady scopes it.",
  "Up to 3 teams build in 2–3 weeks.",
  "Demo review: continue the build with the team you pick, or decide not to continue.",
] as const;

export const HOW_TIME =
  "Total founder time about 1–2 hours.";

export const HOW_TIME_DETAIL =
  "A 30-minute kickoff, a check-in at the end of week 1, and a demo review. Teams may ask a few questions on WhatsApp or email.";

export const PROCESS_STAGES = [
  "Understand the problem",
  "User research",
  "Analyze & plan",
  "Build",
  "Proof & handover",
] as const;

export const PROCESS_FLOW = "idea → validation → build → iterate";

export const FIT_FOR = [
  "You are a founder or an SME business owner.",
  "You have one tech problem, or only a rough idea.",
  "You can give about 1 to 2 hours: a kickoff, a check-in at the end of week 1, and a demo review.",
  "You want to see working demos before you invest in a longer build.",
] as const;

export const FIT_NOT = [
  "Non-tech work like sales calls or content writing.",
  "A production-ready system at the demo stage. The demo is a working prototype, and going production-ready is part of the paid build if you choose to continue.",
  "A problem that cannot be prototyped in a few weeks.",
] as const;

export const PRICING_INTRO =
  "It reserves your project. A longer build is quoted only after you have seen the demos, and only if you want to continue.";

export const PRICING_POINTS = [
  {
    title: "What the fee covers",
    body: "Your problem gets scoped by ImReady, and up to 3 student teams each work on it and ship a working demo. You see every demo before deciding anything else.",
  },
  {
    title: "If you continue the build",
    body: "Continuing the build starts from ₹25,000 for a web or mobile MVP over 10–12 weeks. Pricing is fixed with no hourly billing, and you get a written quote based on the demo you picked before you commit.",
  },
  {
    title: "Production-ready build",
    body: "Yes, once you choose to continue. The demo is a working prototype that proves the idea, and the paid build that follows takes it to production-ready.",
  },
  {
    title: "Invoice",
    body: "Yes, you'll get a GST invoice, so you can claim input credit.",
  },
] as const;

export const PRICING_MODEL = {
  eyebrow: "Pricing",
  title: "Pay ₹449 to see the work. Decide on the rest after.",
  body: "Often, you pay a deposit and wait weeks before seeing anything. Here, you see up to three working demos first. If you want to continue, the web or mobile MVP build starts from ₹25,000 for a 10–12 week project.",
  points: [
    {
      title: "Fixed price, no hourly billing",
      body: "You get a written quote based on the demo you picked, before you commit to anything.",
    },
    {
      title: "Scoped to your demo",
      body: "Covers a web or mobile MVP over 10–12 weeks. The final price depends on scope, and you will know it before you decide.",
    },
    {
      title: "₹449 is all you spend if you stop",
      body: "If you decide not to continue after the demos, the reservation fee is all you have spent.",
    },
  ],
} as const;

export const FAQ_ITEMS = [
  {
    question: "What do I get for ₹449?",
    answer:
      "Your problem gets scoped by ImReady, and up to 3 student teams each work on it and ship a working demo. You see every demo before deciding anything else.",
  },
  {
    question: "Is the reservation fee refundable?",
    answer:
      "Fully refundable if your problem isn't a fit for us, or if no team ships a demo. Non-refundable once demos are delivered. ImReady decides fit at the 30-minute kickoff, before any team starts building.",
  },
  {
    question: "How long?",
    answer: "2 to 3 weeks from the problem being finalised.",
  },
  {
    question: "My time?",
    answer:
      "About 1 to 2 hours: a 30-minute kickoff, a check-in at the end of week 1 and a demo review. Teams may ask a few questions over WhatsApp or email.",
  },
  {
    question: "Who are the students?",
    answer:
      "Screened engineering students who work through a structured product process. Up to three teams work on your problem, so you are not relying on any one team.",
  },
  {
    question: "Who owns the work?",
    answer:
      "The demo you pick, and everything built after, is yours. Demos you don't pick stay with the teams that made them.",
  },
  {
    question: "Data safety / NDA?",
    answer:
      "Yes, an NDA on request, and we recommend sample or dummy data for the demo stage.",
  },
  {
    question: "What if I don't like any demo?",
    answer:
      "You have no further commitment, and you keep the insights and feedback from the teams.",
  },
  {
    question: "What does continuing cost?",
    answer:
      "Continuing the build starts from ₹25,000 for a web or mobile MVP over 10–12 weeks. Pricing is fixed with no hourly billing, and you get a written quote based on the demo you picked before you commit.",
  },
  {
    question: "What problems fit?",
    answer:
      "Tech problems that can be prototyped in a few weeks: an MVP, a clickable prototype, a website or store, an AI feature or chatbot, data tools, dashboards, workflow automation, an internal tool, or a check of the idea before a bigger build. Not non-tech work like sales calls or content writing.",
  },
  {
    question: "Only a rough idea?",
    answer:
      "That works. Teams start with the Understand the problem and User research stages, talking to users to sharpen the problem before building.",
  },
  {
    question: "Production-ready?",
    answer:
      "Yes, once you choose to continue. The demo is a working prototype that proves the idea, and the paid build that follows takes it to production-ready.",
  },
  {
    question: "GST invoice?",
    answer:
      "Yes, you'll get a GST invoice, so you can claim input credit.",
  },
] as const;
