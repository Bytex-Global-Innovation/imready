export const NAV_LINKS = [
  { label: "The Gap", href: "#gap" },
  { label: "Journey", href: "#journey" },
  { label: "Projects", href: "#projects" },
  { label: "FAQ", href: "#faq" },
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
