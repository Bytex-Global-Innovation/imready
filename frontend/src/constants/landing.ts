export const JOURNEY_STAGES = [
  {
    step: 1,
    title: "College Learning",
    description: "Build strong fundamentals through academic learning.",
    icon: "book",
  },
  {
    step: 2,
    title: "Real Project",
    description: "Work on real industry problems and build practical solutions.",
    icon: "code",
  },
  {
    step: 3,
    title: "Mentor Review",
    description: "Get feedback and guidance from industry experts.",
    icon: "mentor",
  },
  {
    step: 4,
    title: "Portfolio Building",
    description: "Create a professional portfolio that showcases your best work.",
    icon: "folder",
  },
  {
    step: 5,
    title: "Placement Ready",
    description:
      "Gain the confidence and experience to land internships and full-time roles.",
    icon: "placement",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Apply",
    description:
      "Choose your area of interest, share contact details, and verify your student profile in minutes.",
  },
  {
    step: "02",
    title: "Get an assignment",
    description:
      "Receive your first real industry brief — the entry test for Stage 1 of the journey.",
  },
  {
    step: "03",
    title: "Submit & get evaluated",
    description:
      "Turn in your work and get a clear pass or fail from real industry reviewers.",
  },
  {
    step: "04",
    title: "Unlock your stage",
    description:
      "Pass, and Stage 1 unlocks — along with every project available at that level.",
  },
] as const;

export const GAP_SECTION = {
  eyebrow: "Old way vs IMReady way",
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
    title: "The IMReady Pathway",
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
    body: "IMReady bridges that gap.",
    accent: "Not in Year 4. From Day One.",
  },
} as const;

export const WHY_CHOOSE_FEATURES = [
  {
    title: "Real Industry Projects",
    description:
      "Work on actual business problems inspired by industry use cases. Build solutions that demonstrate practical skills beyond classroom assignments.",
    icon: "briefcase",
  },
  {
    title: "Expert Mentor Guidance",
    description:
      "Receive continuous feedback from working professionals who understand industry expectations. Learn how real teams think, build, and deliver.",
    icon: "mentor",
  },
  {
    title: "Portfolio That Speaks",
    description:
      "Every completed stage strengthens your professional portfolio with verified project evidence. Show recruiters what you can do, not just what you know.",
    icon: "portfolio",
  },
  {
    title: "Structured Growth Path",
    description:
      "Progress through a clear 5-stage framework from Emerging to Distinguished. Know exactly where you stand and what comes next.",
    icon: "growth-path",
  },
  {
    title: "Industry Validation",
    description:
      "Get evaluated against real-world standards instead of academic grading alone. Earn credibility that recruiters can trust.",
    icon: "shield",
  },
  {
    title: "Career Readiness",
    description:
      "Develop communication, teamwork, execution, and problem-solving skills alongside technical expertise. Be prepared before placement season begins.",
    icon: "career",
  },
] as const;

export const PROJECT_SHOWCASE_ITEMS = [
  {
    domain: "AI / ML",
    title: "Student Dropout Predictor",
    meta: "9 wks · Team of 3",
    domainTone: "blue",
  },
  {
    domain: "Web Dev",
    title: "Campus Event Portal",
    meta: "9 wks · Solo · GitHub",
    domainTone: "emerald",
  },
  {
    domain: "Data Analytics",
    title: "FMCG Market Dashboard",
    meta: "9 wks · Industry brief",
    domainTone: "violet",
  },
  {
    domain: "IoT / Embedded",
    title: "Smart Energy Monitor",
    meta: "9 wks · Team of 4",
    domainTone: "amber",
  },
  {
    domain: "Business Strategy",
    title: "Go-to-Market · D2C Brand",
    meta: "9 wks · MBA track",
    domainTone: "emerald",
  },
  {
    domain: "Finance",
    title: "Equity Research — EV Sector",
    meta: "9 wks · Finance track",
    domainTone: "violet",
  },
  {
    domain: "Cybersecurity",
    title: "Web App Vulnerability Scan",
    meta: "9 wks · CS track",
    domainTone: "blue",
  },
  {
    domain: "Product",
    title: "Feature Roadmap · EdTech",
    meta: "9 wks · MBA/CS",
    domainTone: "amber",
  },
  {
    domain: "Operations",
    title: "Hostel Check-in Redesign",
    meta: "9 wks · Mgmt · SOP",
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
    desc: "Instead of waiting until your final year, you begin solving real problems from Day 1 of your IMReady journey.",
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
      "Top 1% of IMReady cohort",
      "Founding team material",
      "Mentoring junior students",
      "Featured in IMReady showcase",
    ],
  },
] as const;

export const DEVICE_SELECTION = {
  eyebrow: "Device Selection",
  title: "Select Your Project Device",
  description:
    "Choose a device that fits your project requirements. You'll complete the payment via WhatsApp and get it delivered to your college campus.",
  whatsappPhone: "919876543210",
  disclaimer:
    "Laptops are distributed via campus partner MoUs. Prices include student discount mappings.",
  benefits: [
    {
      title: "Trusted & Verified",
      description: "Distributed via certified college partners.",
    },
    {
      title: "Student Benefits",
      description: "Prices include exclusive student discounts.",
    },
    {
      title: "Campus Delivery",
      description: "Safe delivery directly to your campus.",
    },
  ],
  devices: [
    {
      pathBadge: "Path 01 — Direct Entry",
      tierLabel: "Good Everyday",
      name: "IdeaPad Slim 3",
      subtitle: "Lenovo · everyday development",
      specs: [
        "8 GB RAM / 512 GB SSD",
        "Intel Core i3 / AMD Ryzen 3",
        "Lightweight 1.4kg chassis",
        "Direct entrance task bypass",
      ],
      price: 35000,
      priceLabel: "₹35,000",
      whatsappName: "IdeaPad Slim 3",
      highlighted: false,
    },
    {
      pathBadge: "Recommended Choice",
      tierLabel: "Best for Projects",
      name: "IdeaPad Pro 5",
      subtitle: "Lenovo · high performance design",
      specs: [
        "16 GB LPDDR5 RAM / 1 TB SSD",
        "Premium 120Hz OLED Display",
        "AMD Ryzen 7 / Intel Core Ultra 5",
        "Full 4-Year Map Unlocked Instantly",
      ],
      price: 55000,
      priceLabel: "₹55,000",
      whatsappName: "IdeaPad Pro 5",
      highlighted: true,
    },
    {
      pathBadge: "Path 01 — Direct Entry",
      tierLabel: "Workstation Class",
      name: "Legion / ThinkPad",
      subtitle: "Lenovo · AI & ML Workloads",
      specs: [
        "32 GB RAM / 1 TB Gen4 SSD",
        "NVIDIA RTX GPU (DLSS support)",
        "Intel Core i7 / AMD Ryzen 9",
        "Full 4-Year Map + Patent Path",
      ],
      price: 85000,
      priceLabel: "₹85,000",
      whatsappName: "Legion/ThinkPad",
      highlighted: false,
    },
  ],
} as const;

export const LANDING_FAQ = {
  eyebrow: "Common Queries",
  title: "Frequently Asked Questions",
  items: [
    {
      question: "Is this another online course?",
      answer:
        "No. IMReady is not a course platform. Students do not watch passive lectures. Instead, you work directly on real-world projects with active industry professionals. The output is a verified portfolio—not a certificate of completion.",
    },
    {
      question: "Does it replace college?",
      answer:
        "Not at all. IMReady is designed to complement your existing college curriculum. It bridges the gap between academic theory and practical business implementation, requiring no changes to your academic structure.",
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

export const COMPARISON_ROWS = [
  {
    feature: "Dedicated Mentorship",
    traditional: { status: "negative" as const, text: "Often hit-or-miss" },
    imready: { status: "positive" as const, text: "Guaranteed expert guidance" },
  },
  {
    feature: "Work on Real Projects",
    traditional: { status: "neutral" as const, text: "Sometimes busywork" },
    imready: { status: "positive" as const, text: "100% core business tasks" },
  },
  {
    feature: "Verified Portfolio Output",
    traditional: { status: "negative" as const, text: null },
    imready: { status: "positive" as const, text: null },
  },
  {
    feature: "Structured Career Documentation",
    traditional: { status: "negative" as const, text: null },
    imready: { status: "positive" as const, text: null },
  },
] as const;
