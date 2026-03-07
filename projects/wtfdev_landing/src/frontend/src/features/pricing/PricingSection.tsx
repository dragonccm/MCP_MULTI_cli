import { Check } from "lucide-react";
import { Button } from "../../components/Button";
import { PRICING_DATA } from "../../utils/constants";
import { cn } from "../../utils/cn";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-sm font-bold text-accent uppercase tracking-widest">
            // Investment
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-4">
            Pricing Plans
          </h2>
          <p className="text-muted mt-4 max-w-xl mx-auto">
            Transparent pricing for every stage of your business. All plans include
            dedicated support and maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_DATA.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "bg-card brutalist-border p-8 flex flex-col relative",
                tier.highlighted
                  ? "brutalist-shadow-hover md:-translate-y-4 border-accent"
                  : "brutalist-shadow"
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 text-xs font-black uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <h3 className="font-black uppercase tracking-wider text-xl mb-2">
                {tier.name}
              </h3>
              <p className="text-muted text-sm mb-4">{tier.description}</p>

              <div className="mb-6">
                <span className="text-2xl font-black">{tier.price}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className={cn(
                        "flex-shrink-0 mt-0.5",
                        tier.highlighted ? "text-accent" : "text-primary"
                      )}
                      strokeWidth={3}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlighted ? "secondary" : "outline"}
                className="w-full"
                onClick={() => {
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
