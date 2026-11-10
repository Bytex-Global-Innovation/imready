/** Mock data for Stage 2 team formation (Screens 9–10). API later. */

export const STAGE2_TEAM_HEADER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAp-wThH08lOnZOtnGFiUQERk4OYx0AZz34ZoAc1nMhnPv0pM2h6WXT4qTrBCfskC7Jl0Mi2gEZ1y2HdUGe056M25lUKrUcA98JfIwZ8PQaEDcRRmqcV7m26EDSUvsZC0jLZKJQ7CfgfnTvkRJp_5l_D972mY-7eU55vEwQJ4_OaZjSwrCjs5myhagCBygTy4OZ9opCIRaN54qqLEaMFLubtPMTaxGXYHtwqW4UJZ8Z";

export type Stage2TeamMember = {
  id: string;
  name: string;
  role: "lead" | "member";
  subtitle: string;
  badge?: string;
  avatarUrl: string;
  avatarAlt: string;
  status?: "ready" | "joined";
};

export type Stage2TeamCandidate = {
  id: string;
  name: string;
  skills: string;
  tag?: string;
  online?: boolean;
  avatarUrl: string;
  avatarAlt: string;
};

export const STAGE2_LEAD_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVlyFOfYlBRAncqAmA63a8ufQkGiHAKSVvluXmyb2_vr84i9xgPZyQgJW7uRj690YA7yY79Z0cF79le8h6_yXk3kiBWQ1xrFvMh_dIqpJ48TNGtFHj_xb_klGpZOKjL5gk4BnBlkslMS6otVRl43co_e-4xgPXpxQbLxDOT9Gq4dXh8jymOQcVuCXMG1xOU8hcQWSFiGpFuVulSVEAoFmY3IsnEyK2eXAWZiW8s3s8";

export const STAGE2_PRIYA_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC4KgSENHORiacm0E_TM41Fy_7NSpjMQqjPIeIntiaSG3URMeZf2hJvVYIrnEECR8YxGbWCc4wQ2ROj-BQBuUyV2zYA3xWZMTyoRudWSHHTBLrwh3MGQcc0qZXvsjlkvgWLVxSG4765I7tzve2IODy3SaXF__yczYbCdsLHtOEyZy6XCP59GxNKS62jMOHNgbuL9Vt1Ng5T9eJtNiZeowLhCLkKTL8FYHorjy3Ul9_t";

export const STAGE2_ROHAN_DESAI_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuARTfR2BcgWEZkOGi0hz76rjkFcC9-AVYHyaIGITi1YyC82mjLW6P-cJXGN20T9MjoCyayjthlB4-Hb3T0I3dNEfpfTKX-UfD9OtVwAaWiOhKi1TDVtep-sKZ-gHDPx9EMooAtRVrUiqUOMW3MDC0xeRTrSArJEOI5PWc7w-XrpfIh7Vv9PVt_UOMFidheb7Y-M9fbb9Gufq0tGtK-iqFjr_EMzRHm1gIyNlLMIj1n2";

export const STAGE2_CELEBRATION_AVATARS = {
  priya:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB4-Dmdhw9O-Pes_QvgXfjS5EGz3wK2ahvnzx4N4i0JAbn0OjLmXPH6HaXVWeoRN4i6UKKuequPXqbFTmqHTPC2iQ5Gt7igYROI0cUvgc6XWk62y74yHmhgs1Zz7h14H-WL8aR4nEd4qezOxixDK24UdWFfZxs8huI1-z941raQLoKgnu6qLn0pUPZKevvJ4GP8SAbQTs_Zal3r08tWqech61mmrexx0FDTNvWk8Mru",
  lead: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXX1HxZGuuGncOBYL-7IKUO4t6oG8tfIGQlgtEcZyk1BelL9YSzt5eP5z3B6bfeUksAI3_GtSlk6t9rPbfVmmx2cAd8U-frAB6PllKELmEMeCAItUI5L4sqz09wvvnG8iGeAPq0rgWfInetA3kU8ZYcGPGmEokQUMNv3QUkYNO3-9hYgIHTu1hDqRsQpUVZUsSuw61_VEiNJKAka5YLPST3C1CSECGgSW4KtK23GFf",
  rohan:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBFTCEs2ja0maRmHIh3kJL7_4RGvSNMRRarbPOt-_XUSyDBH1xbZ3oH2jZhpTuwBmhgQYciu-xY8xNwuXctkIQNQ4FdjiX7gCOjt3mStCEzGpJaAgh7GVWbVm-eKI5l7_4dU-PPeEGVOfJ7JTpmKWZgFqY79JbzfLFJqAqbyHaX_q4vdcgs1ZTFASfPP60Yk0Dd65FDP0WmBPoK65pBK-bJ038_jTR8kCpvD35lJff-",
};

export function buildDefaultStage2Roster(leadName: string): Stage2TeamMember[] {
  return [
    {
      id: "lead",
      name: leadName,
      role: "lead",
      subtitle: "You (Team Lead) • Full-Stack & Product Strategy",
      badge: "Creator",
      avatarUrl: STAGE2_LEAD_AVATAR,
      avatarAlt: `Portrait photo of ${leadName}, team lead`,
      status: "ready",
    },
    {
      id: "priya",
      name: "Priya Mehta",
      role: "member",
      subtitle: "Team Member • UX Research & Wireframing",
      badge: "Joined",
      avatarUrl: STAGE2_PRIYA_AVATAR,
      avatarAlt: "Professional studio portrait of Priya Mehta",
      status: "joined",
    },
  ];
}

export const STAGE2_TEAM_CANDIDATES: Stage2TeamCandidate[] = [
  {
    id: "rohan-desai",
    name: "Rohan Desai",
    skills: "Full-Stack Dev • React, Node",
    tag: "Stage 2 Ready",
    online: true,
    avatarUrl: STAGE2_ROHAN_DESAI_AVATAR,
    avatarAlt: "Headshot of Rohan Desai",
  },
  {
    id: "rohan-kapoor",
    name: "Rohan Kapoor",
    skills: "Data Analytics • Python, SQL",
    tag: "Top 5% Cohort",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFOjmq3LHNSSq5cWYDLv18GJ0Xg8ArzN7zcGFo0st72P3V76dwYj_VMcuALcNRXpG0E0pEcqCwhtSwgbz1W_IO7HnOwJtDVfkimdPX7mZ3phKXk1ipItrjAZS0A1liYGfybohoNX9AsZxyVe-_ZFTi8Uiq6Md36NSsDjghg30uMEwi4DS6dQezVwNVr4t8JHYPZSVQ-pq3MJ08nosH5Az5l8nzDOEhQlG7KJNddLgc",
    avatarAlt: "Portrait of Rohan Kapoor",
  },
  {
    id: "neha-kapoor",
    name: "Neha Kapoor",
    skills: "UI/UX • Figma, Design Systems",
    tag: "Stage 1 Honors",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiZLIadkxDHBXCS7BZwzuUu2QoAr8w5C1bmJaEilOmRhWWy-_xjruHT3IbNsU_Sij9gTioaA_8tz4IBMvFHXdnIScIsYOTuG4WUYqgTky35BPtQKMqkfh5PUKVzLqRmfoldMRRzVOFx5P03C7DEuRwntq7YESdTb8yC-SgnbrRq4yL1GXho-6XNrV9RBIH1ZCCnlNBsEAVTYy3LVHh34p2TKyMHVs-HK5r0X1YDwGk",
    avatarAlt: "Portrait of Neha Kapoor",
  },
];

export const STAGE2_TEAM_MAX = 5;
export const STAGE2_TEAM_MIN = 2;

export function candidateToMember(candidate: Stage2TeamCandidate): Stage2TeamMember {
  return {
    id: candidate.id,
    name: candidate.name,
    role: "member",
    subtitle: `Team Member • ${candidate.skills.split(" • ")[0] ?? candidate.skills}`,
    badge: "Joined",
    avatarUrl: candidate.avatarUrl,
    avatarAlt: candidate.avatarAlt,
    status: "joined",
  };
}
