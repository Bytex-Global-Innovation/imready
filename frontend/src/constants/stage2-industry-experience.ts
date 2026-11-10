export const STAGE2_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAfiNgxBJM-Wnmn-vFgaP4tjHAao5KRvrm5DmXD25i64rj4MHS7Dr9H7bbnaVrIc9twynQzuvxSUVSDmQ-5IsSkj5dqMwSRYX0RvsjKlWWE3SPUBUSrw-veb4oSxfh5_bfuzOhDZ7-tBSZphHctbtEHArRygTD-ITiJwCUn7lRmqnf7LFFmSogRyib1L1eS2lDsAK_-dR-lumNLBDAOQtNi_KPvJUX9B7Ur2DQZ7od4";

export const STAGE2_PROJECT_CARDS = [
  {
    id: "abc-onboarding",
    badge: { label: "Featured", className: "bg-[#002546]/90 text-white" },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBI60OMS5iDAu4PmeY2nwuRpgqwaukfWsJFn-PuLgC1JXv9bMUmTuVkJp7QvCZ4KN0pT2X76IUjQIHx9mU_GJXdeZ0J13uul3xh2RFXHb2kkpk-LV9PPA9G6VWEecUb7pPc4m1TjedbG6ZZ0-aBXEQT8gznsYS_7CsmqfFrAnOspXBScm_HQKn0zYpPouVNQCVdTNUOrAuxknrIPynY74G5QTNomaRBqezlaRG8-cTk",
    imageAlt:
      "Young diverse university students collaborating cheerfully around a modern laptop in a bright campus innovation lab, reviewing UI sketches for a software project with natural sunlight and plants.",
    company: "ABC Technologies",
    duration: "Up to 30 days",
    title: "Improve Student Onboarding",
    description:
      "Reduce drop-off during onboarding and increase activation rate across desktop and mobile pathways.",
    tags: ["Research", "Product", "UX"],
    teamSize: "2–5 students",
  },
  {
    id: "edutech-ai",
    badge: { label: "AI / Data", className: "bg-[#153a75] text-white" },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA37LNoIXW_v3hSZNL_38gwTRp6Z6z78bOQukLiVAFSvyekqnVE-HtaFU2AgJEaTz7u1Uqc5PSRqzsViTEji9elKDdHgpFEvgIYRHezc6t-KiU313C_noBOhntOloGHrqdh_BZkUCrlO0eHlC45b9lNh77dqV00zQOFcjy_V-hsfG8yYpVKGh8W5k1Xe7v1HADxL_i-eoKi2BYUDDk5Cj_iJe3r6XwACF2wviV4oq1U",
    imageAlt:
      "A focused student analyzing multimodal LLM charts and clean analytics on a modern tablet in a library setting, with soft natural rim lighting and neat technological diagrams.",
    company: "EduTech Labs",
    duration: "Up to 60 days",
    title: "AI Study Assistant for Rural Students",
    description:
      "Prototype an offline-first voice and text copilot to aid multilingual high school STEM learning.",
    tags: ["AI", "Research", "Prototyping"],
    teamSize: "2–5 students",
  },
  {
    id: "greentrace-carbon",
    badge: {
      label: "Sustainability",
      className: "bg-[#0d3b66] text-[#81a6d7]",
    },
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHNAt9LwF53ZHSv439xBhB4TtA6EQnCfaYuxkigFmSK_rWUMi11Dxx-RnodE_WiH-OW6wgu4lCv3CullzjAlO1mBVzSgcfB4pqqtFyd3TKiI7uJGcZqudZtTQuK9cg-ijYuC0k-XJ_0iq5JfvIQZoT3qPBz6mlChEJ6zQK4S7u4GAUJj0spbKRsBjvDsdrLl2yAm6haacpctFomE07H5V8Gr2fDk7K388PtW7UfarZ",
    imageAlt:
      "Modern eco-tech dashboard visualization displaying clean green energy carbon offset statistics, supply chain charts, and sustainable transport metrics on an ultra-wide monitor.",
    company: "GreenTrace Global",
    duration: "30–45 days",
    title: "Supply Chain Carbon Benchmark",
    description:
      "Conduct competitive carbon accounting research and model an intuitive telemetry dashboard for local suppliers.",
    tags: ["Data", "ESG", "Business"],
    teamSize: "3–4 students",
  },
] as const;

export const STAGE2_FILTER_PILLS = [
  "All",
  "Product",
  "AI / Data",
  "Design",
  "Technology",
] as const;

export const STAGE2_VALUE_PILLARS = [
  {
    icon: "terminal",
    iconClassName: "bg-[#153a75]/10 text-[#153a75]",
    title: "Work on real technology & product problems",
    body: "Solve unscripted bottlenecks for active SaaS platforms, FinTech products, and AI workflows.",
  },
  {
    icon: "verified_user",
    iconClassName: "bg-[#0d3b66] text-white",
    title: "Build verified proof of work",
    body: "Receive verifiable digital badges and employer endorsements backed by real GitHub & Figma artifacts.",
  },
  {
    icon: "podium",
    iconClassName: "bg-[#002e97] text-white",
    title: "Get noticed by industry owners",
    body: "Direct weekly check-ins with product leaders, engineering managers, and early-stage startup founders.",
  },
  {
    icon: "monetization_on",
    iconClassName: "bg-[#b8d4ff] text-[#001c38]",
    title: "Potential opportunity for paid continuation",
    body: "Top team deliverables unlock fast-track conversion into Stage 3 funded student ventures and paid internships.",
  },
] as const;
