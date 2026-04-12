export const navData = {
  logo: "Vertoiz",
  ctaText: "Join Waitlist",
};

export const heroData = {
  heading: "Your AI-built app is live.",
  headingAccent: "Is it production-ready?",
  subheading: 
    "Vertoiz scans your AI generated codebase and finds everything production-unsafe before it finds you. Security vulnerabilities, exposed credentials, missing auth, architecture failures, scaling risks. Full report. Real fixes.",
  ctaText: "Join the Waitlist",
  inputPlaceholder: "Enter your email",
};

export const featureRowData = [
  {
    id: 1,
    label: "Scan your codebase",
    description:
      "Point Vertoiz at any AI-generated project. It analyzes your entire codebase end to end and identifies every production-unsafe issue.",
  },
  {
    id: 2,
    label: "Get deep system architecture",
    description:
      "Get a full severity report",
  description: "Every issue sorted by severity — critical, high, medium. Security vulnerabilities, missing auth, architecture failures, scaling risks. All in one dashboard.",
  },
  {
    id: 3,
    label: "Approve fixes and ship",
    description:
      "Each issue comes with the exact fix — code included, plain English explanation. Approve it. Applied directly to your codebase.",
  },
];

export const whySectionData = {
  subheading: "Your vibe coded app works. That's the problem.",

paragraphs: [
  "You built it fast. Cursor, Claude, v0, Windsurf — whatever you used, it shipped. It demos well. It looks real.",
  
  "But underneath it's a security risk waiting to happen.",
  
  "API keys sitting in the frontend. No auth on half the routes. Backend bleeding into the frontend. No service layer. No plan for what happens when more than 10 people use it at once.",
  
  "You don't know what's broken until something breaks in production. Vertoiz finds it first."
],
};

export const featureGridData = [
  {
    id: 1,
    icon: "GitBranch",
    title: "Security Vulnerabilities",
    description:
      "Exposed credentials, insecure data flow, missing input validation — every security issue found and flagged before it ships.",
  },
  {
    id: 2,
    icon: "Radio",
    title: "Missing Authentication",
    description:
      "Unprotected routes, missing role verification, bypassed auth checks. Vertoiz finds every gap in your auth layer.",
  },
  {
    id: 3,
    icon: "ShieldCheck",
    title: "Architecture Failures",
    description:
      "Business logic in the wrong layer, backend bleeding into frontend, no service layer. Every structural failure mapped and fixed.",
  },
  {
    id: 4,
    icon: "Zap",
    title: "Scaling Risks",
    description:
      "No caching, direct database calls from components, no background processing. Vertoiz tells you exactly what breaks at 100, 1k, and 100k users.",
  },
  {
    id: 5,
    icon: "TrendingUp",
    title: "Exact Fix Code",
    description:
      "Every issue comes with the exact fix. Real code, real file paths, plain English explanation of what's changing and why.",
  },
  {
    id: 6,
    icon: "Lock",
    title: "One-Click Apply",
    description:
      "Approve fixes directly from the dashboard. Applied to your codebase instantly. No copy-pasting. No guessing.",
  },
];

export const waitlistCTAData = {
  heading: "Be the first to build right.",
  ctaText: "Join the Waitlist",
  inputPlaceholder: "Enter your email",
};

export const faqData = [
  {
    id: 1,
    question: "What type of projects does Vertoiz work with?",
    answer:
      "Vertoiz is designed for any backend-heavy project built with AI-assisted coding tools. Whether you're shipping a SaaS product, a real-time multiplayer app, or a complex API layer, Vertoiz enforces architecture patterns that keep your codebase production-ready.",
  },
  {
    id: 2,
    question: "Do I need to change my existing workflow?",
    answer:
      "Not at all. Vertoiz integrates directly into your IDE and runs alongside your existing AI coding tools. It watches how your backend is structured in real-time and flags issues without interrupting your flow.",
  },
  {
    id: 3,
    question: "How is this different from a linter or code formatter?",
    answer:
      "Linters catch syntax issues. Vertoiz catches architecture issues — things like missing separation of concerns, insecure data flow patterns, and scalability bottlenecks that no linter can detect.",
  },
  {
    id: 4,
    question: "When will Vertoiz be available?",
    answer:
      "We're currently in a closed early-access phase. Join the waitlist and you'll be among the first to get access when we open the next batch of invites.",
  },
  {
    id: 5,
    question: "Is Vertoiz free to use?",
    answer:
      "We'll offer a generous free tier for individual developers. Team and enterprise plans with advanced enforcement rules and CI/CD integration will be available at launch.",
  },
  {
    id: 6,
    question: "Will there be ongoing support after launch?",
    answer:
      "Yes. We provide continuous updates to our architecture pattern library, regular support, and a community channel for feedback and feature requests.",
  },
];

export const footerData = {
  logo: "Vertoiz",
  copyright: `© ${new Date().getFullYear()} Vertoiz. All rights reserved.`,
  links: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};
