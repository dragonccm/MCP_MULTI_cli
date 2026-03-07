import { useState } from "react";
import { Bot, Workflow, Brain, Code2, Server } from "lucide-react";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { SERVICES_DATA } from "../../utils/constants";
import type { Service } from "../../types";

const SERVICE_ICONS = {
  "ai-automation": Bot,
  "n8n-workflows": Workflow,
  "openclaw-agents": Brain,
  "custom-web-apps": Code2,
  devops: Server,
} as const;

export function ServicesSection() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <section id="services" className="py-24 sm:py-32 bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-sm font-bold text-accent uppercase tracking-widest">
            // What We Do
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-4">
            Our Services
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service) => {
            const IconComponent =
              SERVICE_ICONS[service.slug as keyof typeof SERVICE_ICONS] || Code2;

            return (
              <Card
                key={service.id}
                hover
                onClick={() => setSelectedService(service)}
                className="group"
              >
                <IconComponent
                  size={36}
                  className="text-accent mb-4 group-hover:scale-110 transition-transform"
                  strokeWidth={2}
                />
                <h3 className="font-black uppercase tracking-wider text-lg mb-3">
                  {service.name}
                </h3>
                <p className="text-muted text-sm leading-relaxed line-clamp-3">
                  {service.short_description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-surface text-xs font-mono font-bold border border-border-light"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-accent font-bold text-sm uppercase tracking-wider">
                  Learn More →
                </div>
              </Card>
            );
          })}
        </div>

        <Modal
          isOpen={selectedService !== null}
          onClose={() => setSelectedService(null)}
          title={selectedService?.name || ""}
        >
          {selectedService && (
            <div>
              <p className="text-muted leading-relaxed mb-6">
                {selectedService.full_description}
              </p>

              <h4 className="font-black uppercase tracking-wider text-sm mb-4">
                What&apos;s Included
              </h4>
              <ul className="space-y-2 mb-8">
                {selectedService.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-accent flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant="primary"
                onClick={() => {
                  setSelectedService(null);
                  setTimeout(() => {
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 300);
                }}
              >
                Get Started
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
}
