export type Profile = typeof profile;

export const profile = {
  name: "Kartik Sharma",
  title: "Employee Benefits Manager",
  location: "Bengaluru, India",
  email: "kartiksharma15.07.2004@gmail.com",
  linkedin: "https://www.linkedin.com/in/kartik2004sharma/",
  github: "https://github.com/Kartik2004sharma",
  resumeUrl: "/Kartik_Sharma_Cybersecurity_Resume.pdf" as string | null,
  statement:
    "I connect people-first employee benefits work with a builder’s instinct for useful, reliable digital products.",
  bio: [
    "I’m an Employee Benefits Manager based in Bengaluru, bringing together customer empathy, clear operations, and a computer science foundation. At Pazcare, I work in the fast-moving employee benefits space, where thoughtful communication and dependable execution matter every day.",
    "Before Pazcare, I joined the Taiwan Experience Education Program as a research scholar. That international chapter strengthened my curiosity, adaptability, and comfort working across cultures. Outside work, I build full-stack products that turn complex workflows into practical experiences.",
  ],
  stats: [
    { value: "15", label: "Public repositories" },
    { value: "4", label: "Featured products" },
    { value: "1", label: "International research program" },
    { value: "2", label: "Professional chapters" },
  ],
  experience: [
    {
      role: "Employee Benefits Manager",
      company: "Pazcare",
      location: "Bengaluru, India",
      dates: "Aug 2026 — Present",
      bullets: [
        "Support employee benefits work in a technology-led environment focused on simpler healthcare and insurance experiences.",
        "Bring clear communication, structured problem-solving, and a customer-first mindset to day-to-day operations.",
      ],
      skills: ["Employee Benefits", "Customer Experience", "Operations", "Communication"],
    },
    {
      role: "Research Scholar",
      company: "Taiwan Experience Education Program (TEEP)",
      location: "Taiwan",
      dates: "Sep 2025 — Jan 2026",
      bullets: [
        "Participated in an international research and education program in Taiwan.",
        "Worked in a cross-cultural academic setting while developing research discipline and adaptability.",
      ],
      skills: ["Research", "Cross-cultural Collaboration", "Problem Solving", "Adaptability"],
    },
  ],
  education: {
    degree: "Bachelor of Engineering in Computer Science",
    school: "Chitkara University",
  },
  projects: [
    {
      name: "Nexora",
      category: "FINTECH · UNDERWRITING",
      description:
        "A synthetic-data lending platform with applicant and underwriter workspaces, document evidence, explainable policy checks, and human-reviewed decisions.",
      technologies: ["Vue 3", "TypeScript", "Django", "PostgreSQL"],
      live: "https://nexora-theta-ecru.vercel.app",
      source: null,
      color: "emerald",
    },
    {
      name: "AgentPay",
      category: "AI AGENTS · WEB3",
      description:
        "A governed payment platform for AI agents, with owner-defined spending policies, smart-contract vaults, and auditable payment receipts on Arbitrum Sepolia.",
      technologies: ["Next.js", "TypeScript", "Solidity", "PostgreSQL"],
      live: "https://agent-pay-puce.vercel.app",
      source: null,
      color: "brick",
    },
    {
      name: "CardFi",
      category: "FINTECH · WEB3",
      description:
        "A MetaMask Card hackathon prototype combining wallet activity, USDC vault controls, spending insights, and cross-chain tools in one dashboard.",
      technologies: ["Next.js", "TypeScript", "Solidity", "wagmi", "Tailwind CSS"],
      live: "https://cardfi-eta.vercel.app",
      source: "https://github.com/Kartik2004sharma/Cardfi",
      color: "gold",
    },
    {
      name: "ResolveX",
      category: "AI · OPERATIONS",
      description:
        "A full-stack complaint and maintenance platform with role-based workflows, smart assignment, SLA escalation, analytics, and real-time updates.",
      technologies: ["React", "Node.js", "MongoDB", "Firebase", "OpenAI"],
      live: "https://resolvex-hr2o.vercel.app/",
      source: "https://github.com/Kartik2004sharma/ResolveX",
      color: "brick",
    },
  ],
  skills: [
    { name: "Benefits & People", color: "gold", items: ["Employee Benefits", "Customer Experience", "Operations", "Stakeholder Communication"] },
    { name: "Product & AI", color: "diamond", items: ["Product Thinking", "Workflow Design", "AI-assisted Systems", "Requirement Analysis"] },
    { name: "Engineering", color: "redstone", items: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "REST APIs"] },
    { name: "Data & Platforms", color: "emerald", items: ["MongoDB", "Firebase", "GitHub", "Vercel", "Cloudinary"] },
    { name: "Strengths", color: "lapis", items: ["Research", "Problem Solving", "Adaptability", "Cross-cultural Collaboration"] },
  ],
} as const;
