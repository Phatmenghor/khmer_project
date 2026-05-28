import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {LANDING_CONFIG.pricing.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6 mt-16 items-start">
          {LANDING_CONFIG.pricing.plans.map(({ name, price, period, description, features, highlighted }, i) => (
            <FadeIn key={name} direction="up" delay={i * 120}>
              <Card
                className={cn(
                  "relative border transition-all duration-300 flex flex-col h-full",
                  highlighted
                    ? "border-amber-700 ring-2 ring-amber-700/30 shadow-xl shadow-amber-700/10"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                )}
              >
                {highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="text-sm px-5 py-1.5 bg-amber-700 text-white border-0 shadow-md font-semibold whitespace-nowrap rounded-full">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className={cn(
                  "px-8 pt-10 pb-6 border-b",
                  highlighted ? "bg-amber-50 border-amber-200" : "border-slate-100"
                )}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className={cn("text-5xl font-bold", highlighted ? "text-amber-700" : "text-slate-900")}>
                      {price}
                    </span>
                    {period && <span className="text-slate-600 font-medium">{period}</span>}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                </div>

                {/* Features */}
                <CardContent className="px-8 py-7 flex flex-col flex-1">
                  <ul className="space-y-3 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full h-12 mt-8 font-semibold transition-all",
                      highlighted
                        ? "bg-amber-700 hover:bg-amber-800 text-white"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50 border"
                    )}
                    asChild
                  >
                    <Link href={ROUTES.PUBLIC.REGISTER}>Get Started</Link>
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
