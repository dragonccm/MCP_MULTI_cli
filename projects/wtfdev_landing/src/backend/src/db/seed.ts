import { query } from "../config/database.js";

const SERVICES = [
  {
    name: "AI Automation",
    slug: "ai-automation",
    short_description: "Streamline your business with AI-powered workflows",
    full_description:
      "We help businesses automate repetitive tasks and workflows using cutting-edge AI technology. From simple automations to complex multi-agent systems, we design and implement solutions that save time and reduce costs.",
    features: JSON.stringify([
      "Process automation",
      "AI integration",
      "Custom workflows",
      "Multi-agent systems",
      "API integrations",
    ]),
    display_order: 1,
  },
  {
    name: "n8n Workflows",
    slug: "n8n-workflows",
    short_description: "Custom n8n automation tailored to your needs",
    full_description:
      "We design and implement custom n8n workflows that connect your tools and automate complex business processes.",
    features: JSON.stringify([
      "Workflow design",
      "Integration setup",
      "Error handling",
      "Monitoring & alerts",
      "Maintenance",
    ]),
    display_order: 2,
  },
  {
    name: "OpenClaw Agents",
    slug: "openclaw-agents",
    short_description: "AI agents powered by OpenClaw for specialized tasks",
    full_description:
      "Build intelligent AI agents that handle specialized tasks for your business. From customer support to data analysis.",
    features: JSON.stringify([
      "Custom agents",
      "Task automation",
      "NLP",
      "Integration",
      "Continuous learning",
    ]),
    display_order: 3,
  },
  {
    name: "Custom Web Apps",
    slug: "custom-web-apps",
    short_description: "Modern web applications built for your needs",
    full_description:
      "We build modern web applications using React, Next.js, and Node.js. Pixel-perfect, performant applications your users will love.",
    features: JSON.stringify([
      "React / Next.js",
      "Full-stack development",
      "Responsive design",
      "API development",
      "Database design",
    ]),
    display_order: 4,
  },
  {
    name: "DevOps",
    slug: "devops",
    short_description: "CI/CD, infrastructure, and deployment automation",
    full_description:
      "We set up and manage your DevOps infrastructure, from CI/CD pipelines to cloud deployments.",
    features: JSON.stringify([
      "CI/CD pipelines",
      "Cloud infrastructure",
      "Docker & Kubernetes",
      "Monitoring",
      "Security",
    ]),
    display_order: 5,
  },
];

const PORTFOLIO_PROJECTS = [
  {
    title: "E-commerce Automation System",
    description:
      "Full n8n workflow automation for an online store, handling order processing, inventory management, and customer notifications.",
    category: "AI Automation",
    technologies: JSON.stringify(["n8n", "PostgreSQL", "React", "OpenAI"]),
    client_name: "RetailFlow Inc",
    outcome: "Reduced processing time by 80%, saved 20 hours/week",
  },
  {
    title: "AI Customer Support Agent",
    description:
      "Intelligent customer support agent using OpenClaw that handles 70% of inquiries without human intervention.",
    category: "AI Automation",
    technologies: JSON.stringify(["OpenClaw", "Node.js", "Redis", "WebSocket"]),
    client_name: "TechServe Co",
    outcome: "70% reduction in support tickets, 95% customer satisfaction",
  },
  {
    title: "SaaS Analytics Dashboard",
    description:
      "Modern analytics dashboard with React and D3.js, providing real-time insights for a B2B SaaS platform.",
    category: "Web Dev",
    technologies: JSON.stringify(["React", "TypeScript", "D3.js", "Node.js"]),
    client_name: "DataViz Pro",
    outcome: "40% increase in user engagement, 3x faster data loading",
  },
  {
    title: "CI/CD Pipeline Overhaul",
    description:
      "Redesigned the entire CI/CD pipeline for a fintech startup, reducing deployment time from hours to minutes.",
    category: "DevOps",
    technologies: JSON.stringify([
      "GitHub Actions",
      "Docker",
      "Kubernetes",
      "Terraform",
    ]),
    client_name: "FinStack",
    outcome: "Deploy time reduced from 4 hours to 12 minutes",
  },
];

async function seed(): Promise<void> {
  console.info("Seeding database...");

  for (const svc of SERVICES) {
    await query(
      `INSERT INTO service (id, name, slug, short_description, full_description, features, display_order)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::jsonb, $6)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         short_description = EXCLUDED.short_description,
         full_description = EXCLUDED.full_description,
         features = EXCLUDED.features,
         display_order = EXCLUDED.display_order`,
      [
        svc.name,
        svc.slug,
        svc.short_description,
        svc.full_description,
        svc.features,
        svc.display_order,
      ]
    );
  }
  console.info(`Seeded ${SERVICES.length} services`);

  for (const proj of PORTFOLIO_PROJECTS) {
    const existing = await query(
      `SELECT id FROM portfolio_project WHERE title = $1`,
      [proj.title]
    );
    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO portfolio_project (id, title, description, category, technologies, client_name, outcome)
         VALUES (gen_random_uuid(), $1, $2, $3, $4::jsonb, $5, $6)`,
        [
          proj.title,
          proj.description,
          proj.category,
          proj.technologies,
          proj.client_name,
          proj.outcome,
        ]
      );
    }
  }
  console.info(`Seeded ${PORTFOLIO_PROJECTS.length} portfolio projects`);

  console.info("Seeding completed.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
