import { useState, useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "../../components/Card";
import { PORTFOLIO_DATA } from "../../utils/constants";
import { cn } from "../../utils/cn";

export function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(PORTFOLIO_DATA.map((p) => p.category)));
    return ["All", ...cats];
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return PORTFOLIO_DATA;
    return PORTFOLIO_DATA.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
  };

  const getInitials = (title: string) =>
    title
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const gradientColors = [
    "from-accent/80 to-orange-600/80",
    "from-blue-600/80 to-indigo-700/80",
    "from-emerald-600/80 to-teal-700/80",
    "from-purple-600/80 to-pink-600/80",
    "from-amber-500/80 to-red-600/80",
    "from-cyan-600/80 to-blue-700/80",
  ];

  return (
    <section id="portfolio" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-mono text-sm font-bold text-accent uppercase tracking-widest">
            // Our Work
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-4">
            Case Studies
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange(category)}
              className={cn(
                "px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 transition-all duration-150",
                activeFilter === category
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-primary border-primary/30 hover:border-primary"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 brutalist-border bg-card">
            <p className="text-muted text-lg">
              No projects in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card key={project.id} hover className="group flex flex-col">
                <div
                  className={cn(
                    "h-48 -mx-6 -mt-6 mb-4 flex items-center justify-center bg-gradient-to-br",
                    gradientColors[index % gradientColors.length]
                  )}
                >
                  <span className="text-4xl font-black text-white/90">
                    {getInitials(project.title)}
                  </span>
                </div>

                <span className="inline-block px-2 py-1 bg-surface text-xs font-mono font-bold border border-border-light w-fit mb-3">
                  {project.category}
                </span>

                <h3 className="font-black uppercase tracking-wider text-base mb-2 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>

                <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                  {project.description}
                </p>

                {project.outcome && (
                  <div className="bg-accent/5 border-l-4 border-accent px-4 py-2 mb-4">
                    <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
                      Result
                    </p>
                    <p className="text-sm font-medium">{project.outcome}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs font-mono bg-primary/5 border border-border-light"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-accent font-bold text-sm uppercase tracking-wider mt-auto">
                  <span>View Details</span>
                  <ExternalLink size={14} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
