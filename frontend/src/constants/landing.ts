export const GAP_SECTION = {
  eyebrow: "Old way vs ImReady way",
  title: "From classroom learning to",
  titleAccent: "industry readiness.",
  description:
    "Knowing how something works is different from using it on the job. ImReady helps you close that gap long before placements begin.",
  traditional: {
    title: "Traditional college journey",
    steps: [
      "Lectures and exams",
      "Academic assignments",
      "Theoretical learning",
      "Placement preparation in final year",
    ],
    shock: "Limited industry experience",
  },
  imready: {
    title: "ImReady journey",
    steps: [
      "Guided industry projects",
      "Industry mentorship",
      "Practical skill building",
      "A portfolio of real work",
      "Industry exposure from Year 1",
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
] as const;

export const JOURNEY_MAP_SECTION = {
  eyebrow: "YOUR INDUSTRY JOURNEY",
  title: "Your journey: from foundation to paid industry work.",
  description: "You don’t need it all figured out today. Three steps, each building on the last: lay your foundation, prove yourself on real industry projects, then get paid for your expertise. Tap a step to explore it.",
  subdescription: "",
  hint: "Click any stage to explore what you'll unlock",
} as const;

export const JOURNEY_MAP_STAGES = [
  {
    num: "01",
    name: "Foundation",
    headline: 'Build a foundation industry respects',
    desc: "Start with the core skills, tools and workflows real teams use, guided by a mentor from day one. You finish ready for real work.",
    points: [
      "Learn the core tools and workflows teams use",
      "Complete a guided starter project",
      "Unlock access to real industry projects",
    ],
    mindset: "Maybe I really can build actual industry product.",
    
  },
  {
    num: "02",
    name: "Industry Projects",
    headline: "Real briefs. Real feedback. A portfolio that proves it.",
    desc: "Work on projects set by industry and reviewed by working professionals. Every project you finish becomes verified proof of what you can do.",
    points: [
      "Deliver real industry briefs",
      "Get regular mentor reviews and feedback",
      "Grow a verified portfolio",
    ],
    mindset: "I have real work I can point to.",
    
  },
  {
    num: "03",
    name: "Paid Industry Projects",
    headline: "Your expertise, valued and paid.",
    desc: 'Once your work meets industry standards, you move into paid projects. You are rewarded for the skills you have built and the track record behind them.',
    points: [
      "Take on paid industry projects",
      "Deliver to professional standards",
      "Build a track record employers trust",
    ],
    mindset: "I’m earning from skills I built in college",
    
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
      question: "Does it cost anything to join?",
      answer:
        "No. It’s free for students of our selected founding partner colleges. Join now to get your first industry project and mentor.",
    },
  ],
} as const;


export const MENTORSHIP_SECTION = {
  eyebrow: "Mentorship Excellence",
  title: "Learn from people who do this work.",
  
  description:
    "Your mentors are working professionals and alumni of leading institutions. They review your work and tell you what industry expects.",
  academicMentorsTitle: "Your Mentors",
  academicMentorsSubtitle: "Top institution alumni guiding your core path.",
  successfulExplorersTitle: "What students have achieved ",
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
    name: "Dilpreet Singh",
    role: "Software Engineer • Wolters Kluwer",
    imageSrc: "/mentor-dilpreet.jpeg",
    imageAlt: "Portrait of Dilpreet Singh",
  },
  {
    name: "Hemant Nagalkar",
    role: "Founder & CEO • IIM Raipur • Ex-Lenovo, Infosys Consulting, UpGrad, Wipro, Capgemini • 2x Founder",
    imageSrc: "/mentor-hemant.png",
    imageAlt: "Portrait of Hemant Nagalkar",
  },
  {
    name: "Yogesh Murumkar",
    role: "Corporate Trainer & CEO • Bharat Software Solutions",
    imageSrc: "/mentor-yogesh.png",
    imageAlt: "Portrait of Yogesh Murumkar",
  },
];

export const SUCCESSFUL_EXPLORERS: MentorshipPerson[] = [
  {
    name: "Urja Wagh",
    role: "Marketing head at Softbyte Pvt.Ltd.",
    imageSrc: "/achievement-2.jpeg",
    imageAlt: "Portrait of Urja Wagh",
  },
  {
    name: "Krishna Marathe, Samarth, Rutuja, Kartik, Indranil",
    role: "Patent Published",
    imageSrc: "/achievement-1.jpeg",
    imageAlt: "Portrait of Patent",
  },
  {
    name: "Teesha Madan",
    role: "Research paper published at IEEE conference",
    imageSrc: "/achievement-3.jpeg",
    imageAlt: "Portrait of Teesha",
  },
];

export const INDUSTRY_LOGOS = [
  { name: "BNY", src: "/bny.png" },
  { name: "PhonePe", src: "/phonepe.png" },
  { name: "Mastercard", src: "/mastercard.png" },
  { name: "TCS", src: "/tcs.png" },
  { name: "Institution", src: "/institution.png" },
] as const;

export const INDUSTRY_LOGOS_LABEL = "Learn from the Best in the Industry";