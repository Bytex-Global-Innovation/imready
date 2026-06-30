export const NAV_LINKS = [
  { label: "Why IMReady", href: "#why-imready" },
  { label: "5-Stage Journey", href: "#journey" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Colleges", href: "/for-colleges" },
  { label: "Contact", href: "#contact" },
] as const;

export const FOOTER_LINKS = {
  platform: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "FAQ", href: "/faq" },
  ],
  programs: [
    { label: "Software Engineering", href: "#" },
    { label: "Data Science", href: "#" },
    { label: "Product Design", href: "#" },
  ],
} as const;

export const SITE_CONFIG = {
  name: "IMReady",
  tagline:
    "Bridging the gap between academic learning and industry expectations through hands-on experience.",
  email: "hello@imready.com",
  copyright: "© 2024 IMReady. All rights reserved.",
} as const;
