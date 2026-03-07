import { ArrowDown, Zap } from "lucide-react";
import { Button } from "../../components/Button";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center pt-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, #0A0A0A 0px, #0A0A0A 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(90deg, #0A0A0A 0px, #0A0A0A 1px, transparent 1px, transparent 60px)`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border-2 border-accent text-accent font-mono text-sm font-bold mb-8">
            <Zap size={16} />
            <span>AI-POWERED SOLUTIONS</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
            We Build
            <br />
            <span className="text-accent">Intelligent</span>
            <br />
            Systems
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-2xl leading-relaxed mb-12">
            AI automation, n8n workflows, OpenClaw agents, custom web apps, and
            DevOps — everything your business needs to operate at peak
            efficiency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start a Project
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Services
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <a
            href="#about"
            aria-label="Scroll to about section"
            className="p-2 border-2 border-primary/30 hover:border-primary transition-colors inline-block"
          >
            <ArrowDown size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
