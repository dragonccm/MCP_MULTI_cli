import { useState } from "react";
import { Target, Cpu, Globe, Shield } from "lucide-react";

const VALUES = [
  {
    icon: Cpu,
    title: "AI-First Approach",
    description:
      "We leverage cutting-edge AI to solve real business problems, not just follow trends.",
  },
  {
    icon: Target,
    title: "Results-Driven",
    description:
      "Every solution is measured by tangible outcomes — time saved, costs reduced, efficiency gained.",
  },
  {
    icon: Globe,
    title: "Full-Stack Capability",
    description:
      "From frontend to infrastructure, we handle the entire stack so you focus on your business.",
  },
  {
    icon: Shield,
    title: "Reliable & Scalable",
    description:
      "Built for production — our solutions are battle-tested, monitored, and ready to scale.",
  },
] as const;

export function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  const fullText = `WTFDev is a technology studio specializing in AI automation, custom web development, and modern DevOps practices. We partner with businesses of all sizes to design and implement intelligent systems that eliminate repetitive work, reduce operational costs, and unlock new growth opportunities.

Our team combines deep expertise in n8n workflow automation, OpenClaw AI agents, and full-stack web development to deliver end-to-end solutions. Whether you need to automate a complex business process, build a modern web application, or set up a robust CI/CD pipeline, we have the skills and experience to make it happen.`;

  const shortText = fullText.slice(0, 280) + "...";

  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="font-mono text-sm font-bold text-accent uppercase tracking-widest">
            // About Us
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-4 mb-6">
            Who We Are
          </h2>
          <div className="text-muted leading-relaxed text-lg">
            <p className="whitespace-pre-line">
              {expanded ? fullText : shortText}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-accent font-bold text-sm uppercase tracking-wider hover:underline"
            >
              {expanded ? "Read Less" : "Read More"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="bg-card brutalist-border brutalist-shadow-sm p-6 transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <value.icon
                size={32}
                className="text-accent mb-4"
                strokeWidth={2.5}
              />
              <h3 className="font-black uppercase tracking-wider text-sm mb-2">
                {value.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
