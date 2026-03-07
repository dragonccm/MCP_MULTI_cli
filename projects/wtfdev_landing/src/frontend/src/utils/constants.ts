import type { PricingTier, Service } from "../types";

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
] as const;

export const SERVICES_DATA: Service[] = [
  {
    id: "1",
    name: "AI Automation",
    slug: "ai-automation",
    short_description:
      "Streamline your business with AI-powered workflows and intelligent process automation.",
    full_description:
      "We help businesses automate repetitive tasks and workflows using cutting-edge AI technology. From simple automations to complex multi-agent systems, we design and implement solutions that save time and reduce costs.",
    icon_url: null,
    features: [
      "Process automation",
      "AI integration",
      "Custom workflows",
      "Multi-agent systems",
      "API integrations",
    ],
    display_order: 1,
    active: true,
  },
  {
    id: "2",
    name: "n8n Workflows",
    slug: "n8n-workflows",
    short_description:
      "Custom n8n automation pipelines tailored to your business processes.",
    full_description:
      "We design and implement custom n8n workflows that connect your tools and automate complex business processes. From lead nurturing to data synchronization, we build reliable automation that scales.",
    icon_url: null,
    features: [
      "Workflow design",
      "Integration setup",
      "Error handling",
      "Monitoring & alerts",
      "Maintenance & support",
    ],
    display_order: 2,
    active: true,
  },
  {
    id: "3",
    name: "OpenClaw Agents",
    slug: "openclaw-agents",
    short_description:
      "AI agents powered by OpenClaw for specialized business tasks.",
    full_description:
      "Build intelligent AI agents that handle specialized tasks for your business. From customer support to data analysis, our OpenClaw-powered agents work autonomously to deliver results.",
    icon_url: null,
    features: [
      "Custom agents",
      "Task automation",
      "Natural language processing",
      "Integration with existing tools",
      "Continuous learning",
    ],
    display_order: 3,
    active: true,
  },
  {
    id: "4",
    name: "Custom Web Apps",
    slug: "custom-web-apps",
    short_description:
      "Modern, performant web applications built with React and Node.js.",
    full_description:
      "We build modern web applications using React, Next.js, and Node.js. From landing pages to complex SaaS platforms, we deliver pixel-perfect, performant applications that your users will love.",
    icon_url: null,
    features: [
      "React / Next.js",
      "Full-stack development",
      "Responsive design",
      "API development",
      "Database design",
    ],
    display_order: 4,
    active: true,
  },
  {
    id: "5",
    name: "DevOps",
    slug: "devops",
    short_description:
      "CI/CD pipelines, cloud infrastructure, and deployment automation.",
    full_description:
      "We set up and manage your DevOps infrastructure, from CI/CD pipelines to cloud deployments. We help you ship faster, more reliably, and with less overhead.",
    icon_url: null,
    features: [
      "CI/CD pipelines",
      "Cloud infrastructure (AWS, GCP, Azure)",
      "Docker & Kubernetes",
      "Monitoring & logging",
      "Security & compliance",
    ],
    display_order: 5,
    active: true,
  },
];

export const PRICING_DATA: PricingTier[] = [
  {
    name: "Starter",
    price: "Starting at $999",
    description: "Perfect for small businesses looking to automate key processes.",
    features: [
      "1 automation workflow",
      "Basic AI integration",
      "Email support",
      "Monthly maintenance",
      "Up to 1,000 tasks/month",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "Starting at $2,999",
    description: "For growing teams that need comprehensive automation solutions.",
    features: [
      "Up to 5 automation workflows",
      "Advanced AI agents",
      "Priority support",
      "Weekly maintenance",
      "Up to 10,000 tasks/month",
      "Custom integrations",
      "Performance analytics",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "Tailored solutions for large organizations with complex needs.",
    features: [
      "Unlimited workflows",
      "Custom AI agent development",
      "24/7 dedicated support",
      "Daily maintenance",
      "Unlimited tasks",
      "On-premise deployment",
      "SLA guarantee",
      "Security audit",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export const PORTFOLIO_DATA = [
  {
    id: "p1",
    title: "E-commerce Automation System",
    description:
      "Full n8n workflow automation for an online store, handling order processing, inventory management, and customer notifications automatically.",
    category: "AI Automation",
    thumbnail_url: null,
    gallery_urls: [],
    client_name: "RetailFlow Inc",
    technologies: ["n8n", "PostgreSQL", "React", "OpenAI"],
    outcome: "Reduced processing time by 80%, saved 20 hours/week",
    published: true,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2026-01-15T14:30:00Z",
  },
  {
    id: "p2",
    title: "AI Customer Support Agent",
    description:
      "Built an intelligent customer support agent using OpenClaw that handles 70% of customer inquiries without human intervention.",
    category: "AI Automation",
    thumbnail_url: null,
    gallery_urls: [],
    client_name: "TechServe Co",
    technologies: ["OpenClaw", "Node.js", "Redis", "WebSocket"],
    outcome: "70% reduction in support tickets, 95% customer satisfaction",
    published: true,
    created_at: "2025-11-15T10:00:00Z",
    updated_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "p3",
    title: "SaaS Analytics Dashboard",
    description:
      "A modern analytics dashboard built with React and D3.js, providing real-time insights for a B2B SaaS platform.",
    category: "Web Dev",
    thumbnail_url: null,
    gallery_urls: [],
    client_name: "DataViz Pro",
    technologies: ["React", "TypeScript", "D3.js", "Node.js"],
    outcome: "40% increase in user engagement, 3x faster data loading",
    published: true,
    created_at: "2025-10-20T10:00:00Z",
    updated_at: "2025-12-05T11:30:00Z",
  },
  {
    id: "p4",
    title: "CI/CD Pipeline Overhaul",
    description:
      "Redesigned the entire CI/CD pipeline for a fintech startup, reducing deployment time from hours to minutes.",
    category: "DevOps",
    thumbnail_url: null,
    gallery_urls: [],
    client_name: "FinStack",
    technologies: ["GitHub Actions", "Docker", "Kubernetes", "Terraform"],
    outcome: "Deploy time reduced from 4 hours to 12 minutes",
    published: true,
    created_at: "2025-09-10T10:00:00Z",
    updated_at: "2025-11-20T16:00:00Z",
  },
  {
    id: "p5",
    title: "Lead Nurturing Automation",
    description:
      "Automated lead nurturing pipeline using n8n, integrating CRM, email marketing, and scoring systems.",
    category: "AI Automation",
    thumbnail_url: null,
    gallery_urls: [],
    client_name: "GrowthHub",
    technologies: ["n8n", "HubSpot API", "OpenAI", "PostgreSQL"],
    outcome: "2x increase in qualified leads, 50% faster conversion",
    published: true,
    created_at: "2025-08-05T10:00:00Z",
    updated_at: "2025-10-15T13:00:00Z",
  },
  {
    id: "p6",
    title: "Healthcare Booking Platform",
    description:
      "Full-stack web application for a healthcare provider, featuring appointment scheduling, patient portal, and telehealth integration.",
    category: "Web Dev",
    thumbnail_url: null,
    gallery_urls: [],
    client_name: "MedConnect",
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
    outcome: "30% increase in bookings, 4.8/5 user rating",
    published: true,
    created_at: "2025-07-01T10:00:00Z",
    updated_at: "2025-09-30T10:00:00Z",
  },
];

export const API_BASE_URL = "/api";
