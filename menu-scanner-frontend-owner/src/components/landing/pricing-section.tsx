import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

const plans = [
  {
    name: "1 Week",
    duration: "7 Days",
    popular: false,
    bestValue: false,
    description: "Perfect for trying out EMenu Cambodia with no commitment.",
    features: [
      "Digital menu creation",
      "QR code generation",
      "Basic analytics",
      "1 restaurant location",
      "Email support",
    ],
    ctaVariant: "outline" as const,
  },
  {
    name: "1 Month",
    duration: "30 Days",
    popular: true,
    bestValue: false,
    description: "The smart choice for restaurants ready to grow their business.",
    features: [
      "Digital menu creation",
      "QR code generation",
      "Basic analytics",
      "1 restaurant location",
      "Email support",
      "Advanced analytics & reports",
      "Multiple menus",
      "Real-time order notifications",
      "Priority email support",
      "Menu customization",
    ],
    ctaVariant: "default" as const,
  },
  {
    name: "1 Year",
    duration: "365 Days",
    popular: false,
    bestValue: true,
    description:
      "Full access for established restaurants serious about growth.",
    features: [
      "Digital menu creation",
      "QR code generation",
      "Basic analytics",
      "1 restaurant location",
      "Email support",
      "Advanced analytics & reports",
      "Multiple menus",
      "Real-time order notifications",
      "Priority email support",
      "Menu customization",
      "Multiple locations",
      "Custom branding",
      "Dedicated account manager",
      "API access",
      "Staff management",
    ],
    ctaVariant: "outline" as const,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <Badge variant="outline" className="text-sm px-4 py-1.5 mb-6">
              Pricing
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-5">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All plans are completely free during our launch period.
            </p>
          </div>
        </FadeIn>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16 items-start">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} direction="up" delay={i * 150}>
              <Card
                className={cn(
                  "relative border transition-all duration-200",
                  plan.popular
                    ? "ring-2 ring-primary border-primary/30 bg-primary/5"
                    : "border-border/60"
                )}
              >
                {/* Badge */}
                {(plan.popular || plan.bestValue) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className={cn(
                        "text-sm px-4 py-1.5",
                        plan.popular
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {plan.popular ? "Most Popular" : "Best Value"}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 pt-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-foreground">
                      {plan.name}
                    </span>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {plan.duration}
                    </Badge>
                  </div>

                  <div className="flex items-end gap-1 mt-3 mb-1">
                    <span
                      className={cn(
                        "text-6xl font-bold",
                        plan.popular ? "text-primary" : "text-foreground"
                      )}
                    >
                      $0
                    </span>
                    <span className="text-xl text-muted-foreground mb-2">
                      {plan.name === "1 Week"
                        ? "/week"
                        : plan.name === "1 Month"
                        ? "/month"
                        : "/year"}
                    </span>
                  </div>

                  <p className="text-base text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 p-10">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-base"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.ctaVariant}
                    className="w-full h-14 text-xl"
                    asChild
                  >
                    <Link href={ROUTES.PUBLIC.REGISTER}>
                      Get Started Free
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
