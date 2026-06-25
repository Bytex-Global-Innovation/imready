import { WHY_CHOOSE_FEATURES } from "@/constants";
import { Card } from "@/components/ui";
import { FeatureIcon } from "@/features/landing/components/feature-icon";

export function WhyChooseSection() {
  return (
    <section id="why-imready" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose IMReady
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            We bridge the gap between academic learning and industry expectations
            through hands-on experience.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_FEATURES.map((feature) => (
            <Card key={feature.title} className="h-full">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50">
                <FeatureIcon name={feature.icon} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
