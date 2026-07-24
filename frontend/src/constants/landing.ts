export const GAP_SECTION = {
  eyebrow: "Old way vs ImReady way",
  title: "Engineering education is changing",
  titleAccent: "too slowly.",
  description:
    "Every year, millions of students enter college with ambition. For the first two years, they attend lectures, write exams, and do boilerplate assignments. Then during placements, they're suddenly expected to solve real business problems.",
  traditional: {
    title: "The Traditional Route",
    steps: [
      "Lectures & Exams",
      "Textbook Assignments",
      "Rote Memorization",
      "Final Year Placements",
    ],
    shock: "The Placement Reality Shock",
  },
  imready: {
    title: "The ImReady Pathway",
    steps: [
      "Guided Industry Projects",
      "Working Industry Mentors",
      "Verifiable Portfolio of Work",
      "Confidence starting Year 1",
      "Direct Placement Readiness",
    ],
  },
  conclusion: {
    heading: "College rewards marks. Industry rewards capability.",
    body: "ImReady bridges that gap.",
    accent: "Not in Year 4. From Day One.",
  },
} as const;

export const PROJECT_SHOWCASE_ITEMS = [
  {
    domain: "AI / ML",
    title: "Student Dropout Predictor",
    subtitle: "9 wks · Team of 3",
    domainTone: "blue",
  },
  {
    domain: "Web Dev",
    title: "Campus Event Portal",
    subtitle: "9 wks · Solo · GitHub",
    domainTone: "emerald",
  },
  {
    domain: "Data Analytics",
    title: "FMCG Market Dashboard",
    subtitle: "9 wks · Industry brief",
    domainTone: "violet",
  },
  {
    domain: "IoT / Embedded",
    title: "Smart Energy Monitor",
    subtitle: "9 wks · Team of 4",
    domainTone: "amber",
  },
  {
    domain: "Business Strategy",
    title: "Go-to-Market · D2C Brand",
    subtitle: "9 wks · MBA track",
    domainTone: "emerald",
  },
  {
    domain: "Finance",
    title: "Equity Research — EV Sector",
    subtitle: "9 wks · Finance track",
    domainTone: "violet",
  },
  {
    domain: "Cybersecurity",
    title: "Web App Vulnerability Scan",
    subtitle: "9 wks · CS track",
    domainTone: "blue",
  },
  {
    domain: "Product",
    title: "Feature Roadmap · EdTech",
    subtitle: "9 wks · MBA/CS",
    domainTone: "amber",
  },
  {
    domain: "Operations",
    title: "Hostel Check-in Redesign",
    subtitle: "9 wks · Mgmt · SOP",
    domainTone: "emerald",
  },
] as const;

export const JOURNEY_MAP_SECTION = {
  eyebrow: "Interactive Journey",
  title: "Every student starts somewhere.",
  description:
    "The goal isn't to finish a course. It's to become someone industry trusts.",
  subdescription: "Follow our structured 5-stage pathway.",
  hint: "Click any stage to explore what you'll unlock",
} as const;

export const JOURNEY_MAP_STAGES = [
  {
    num: "01",
    name: "Emerging",
    headline: 'You stop being "just another student."',
    desc: "Instead of waiting until your final year, you begin solving real problems from Day 1 of your ImReady journey.",
    points: [
      "Complete your first guided industry project",
      "Paired with an industry mentor",
      "Build foundational code and research confidence",
    ],
    mindset: "Maybe I really can build actual industry software.",
    cards: [
      "First real project scoped and assigned",
      "Paired with an industry mentor",
      "Portfolio entry #1 created",
      "Professional communication practiced",
    ],
  },
  {
    num: "02",
    name: "Developing",
    headline: "You learn from people who build every day.",
    desc: "Real feedback from working professionals. Real industry workflows. Real growth.",
    points: [
      "Work directly with industry mentors",
      "Receive structured feedback on deliverables",
      "Grow your portfolio with reviewed outputs",
      "Learn live industry workflows and deployment pipelines",
    ],
    mindset: "I am becoming a capable developer.",
    cards: [
      "Mentor sessions scheduled weekly",
      "Feedback → Revise → Deliver cycle",
      "Second project in progress",
      "Industry tools adopted",
    ],
  },
  {
    num: "03",
    name: "Secured",
    headline: "Your work begins speaking for itself.",
    desc: 'Instead of saying "I know AI" — you say "I built this." Evidence over claims.',
    points: [
      "Verified portfolio created and audited",
      "Projects linked, not just listed",
      "Placement confidence secured",
      "Placement-ready proof of work assembled",
    ],
    mindset: "I belong in the industry.",
    cards: [
      "Portfolio certified by industry reviewers",
      "Projects linked, not just listed",
      "Placement confidence secured",
      "Work presented to real stakeholders",
    ],
  },
  {
    num: "04",
    name: "Established",
    headline: "Now you're creating value.",
    desc: "People begin trusting you with meaningful, paid work. You've crossed from student to contributor.",
    points: [
      "Freelancing opportunities open via networks",
      "Startup project collaborations",
      "Paid research assignments",
      "Real-world open-source or company codebase contributions",
    ],
    mindset: "I don't just learn. I build and contribute to businesses.",
    cards: [
      "First client or startup project",
      "Earning while still studying",
      "Deep expertise in a domain",
      "Industry network formed",
    ],
  },
  {
    num: "05",
    name: "Distinguished",
    headline: "Very few students reach here.",
    desc: "These students don't wait for opportunities. They create them. Industry knows their name.",
    points: [
      "Lead cross-functional engineering teams",
      "Build innovative, high-impact patented architectures",
      "Mentor the next junior cohort",
      "Work on sponsored research with IP co-filing",
    ],
    mindset: "My portfolio co-files intellectual property in my own name.",
    cards: [
      "Top 1% of ImReady cohort",
      "Founding team material",
      "Mentoring junior students",
      "Featured in ImReady showcase",
    ],
  },
] as const;

export const LANDING_FAQ = {
  eyebrow: "Common Queries",
  title: "Frequently Asked Questions",
  items: [
    {
      question: "Is this another online course?",
      answer:
        "No. ImReady is not a course platform. Students do not watch passive lectures. Instead, you work directly on real-world projects with active industry professionals. The output is a verified portfolio—not a certificate of completion.",
    },
    {
      question: "Does it replace college?",
      answer:
        "Not at all. ImReady is designed to complement your existing college curriculum. It bridges the gap between academic theory and practical business implementation, requiring no changes to your academic structure.",
    },
    {
      question: "How much time is needed weekly?",
      answer:
        "Around 6–8 hours per week. Projects are structured with clear milestones and checked checkpoints so that you can easily balance them alongside a full academic semester.",
    },
    {
      question: "Who are the mentors?",
      answer:
        "Active industry professionals—product managers, software engineers, data analysts, and startup founders who build products daily. They provide constructive code reviews and project standup critiques.",
    },
    {
      question: "Is the pilot batch free?",
      answer:
        "Yes—completely free for students of selected founding partner colleges. We are co-building the pilot batch with our educational partners at this stage.",
    },
  ],
} as const;


export const MENTORSHIP_SECTION = {
  eyebrow: "Mentorship Excellence",
  title: "Learn from the best to achieve",
  titleAccent: "your best.",
  description:
    "Our elite team of industry experts and alumni from world-class institutions are dedicated to guiding your educational transition with precision and clarity.",
  academicMentorsTitle: "Academic Mentors",
  academicMentorsSubtitle: "Top institution alumni guiding your core path.",
  successfulExplorersTitle: "Successful Explorers",
  successfulExplorersSubtitle:
    "Meet the students who have transformed their careers through our mentorship program.",
} as const;

export interface MentorshipPerson {
  name: string;
  role: string;
  imageSrc: string;
  imageAlt: string;
}

export const ACADEMIC_MENTORS: MentorshipPerson[] = [
  {
    name: "Dr. Arjan Singh",
    role: "IIT Delhi Alumnus • Physics Lead",
    imageSrc:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Portrait of Dr. Arjan Singh",
  },
  {
    name: "Meera Krishnan",
    role: "Stanford Scholar • Career Strategist",
    imageSrc:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Portrait of Meera Krishnan",
  },
  {
    name: "Rahul Varma",
    role: "Ex-Amazon • Senior Systems Guide",
    imageSrc:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Portrait of Rahul Varma",
  },
];

export const SUCCESSFUL_EXPLORERS: MentorshipPerson[] = [
  {
    name: "Sriram Teja",
    role: "Senior Developer at Google",
    imageSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Portrait of Sriram Teja",
  },
  {
    name: "Pranavi R.",
    role: "Machine Learning Scientist • Apple",
    imageSrc:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Portrait of Pranavi R.",
  },
  {
    name: "Rakesh Misra",
    role: "Founder, Uhana • Stanford Alumnus",
    imageSrc:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Portrait of Rakesh Misra",
  },
];