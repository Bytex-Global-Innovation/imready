import { ROUTES } from "./routes";

export const BYTEX_HERO = {
  title: "Unlock Your Journey with Bytex",
  description:
    "Experience the next evolution of hardware-enabled learning. Bytex devices seamlessly integrate with the IMReady platform, instantly unlocking advanced educational stages and exclusive features. Equip yourself for success.",
  primaryAction: {
    label: "Explore Devices",
    href: ROUTES.productComparison,
  },
} as const;

export const BYTEX_HOW_IT_WORKS = {
  title: "How Bytex Works",
  subtitle: "A simple three-step process to get you learning on advanced stages.",
  steps: [
    {
      step: 1,
      title: "Choose Device",
      description:
        "Select from our range of eligible Bytex hardware designed for students.",
    },
    {
      step: 2,
      title: "Verify Purchase",
      description:
        "Link your device serial number to your IMReady account securely.",
    },
    {
      step: 3,
      title: "Unlock Stage 01",
      description:
        "Instant access granted to Stage 01 curriculum and community features.",
    },
  ],
} as const;

export const BYTEX_DEVICES = {
  title: "Eligible Devices",
  subtitle: "Purchase any of these devices to unlock your journey.",
  viewAllLink: {
    label: "View All Specs",
    href: ROUTES.productComparison,
  },
} as const;

export const BYTEX_FAQ = {
  title: "Frequently Asked Questions",
  items: [
    {
      question: "How quickly is Stage 01 unlocked?",
      answer:
        "Once your device serial number is verified, Stage 01 unlocks instantly on your IMReady account — typically within minutes of linking.",
    },
    {
      question: "Do I need to maintain an active subscription?",
      answer:
        "Your device unlock is tied to your IMReady account. An active platform subscription is required to access ongoing curriculum and mentor features.",
    },
    {
      question: "Can I link multiple devices to one account?",
      answer:
        "Yes. You can link multiple eligible Bytex devices to a single account, but stage unlocks apply once per verified device purchase.",
    },
  ],
  primaryAction: {
    label: "Explore All Devices",
    href: ROUTES.productComparison,
  },
} as const;
