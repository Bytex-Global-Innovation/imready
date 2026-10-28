export const NAV_LINKS = [
  { label: "Why I'm Ready", href: "#gap" },
  { label: "Journey", href: "#journey" },
  { label: "Projects", href: "#projects" },
  { label: "FAQ", href: "#faq" },
] as const;

export const FOOTER_LINKS = {
  platform: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    // { label: "FAQ", href: "/faq" },
  ],
  programs: [
    { label: "Software Engineering", href: "#" },
    { label: "Data Science", href: "#" },
    { label: "Product Design", href: "#" },
  ],
} as const;

export const SITE_CONFIG = {
  name: "ImReady",
  tagline:
    "Bridging the gap between academic learning and industry expectations through hands-on experience.",
  email: "imready.in",
  copyright: "© 2026 ImReady. All rights reserved.",
} as const;
