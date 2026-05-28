import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

const allFeatures = [
  "QR Digital Menu & Ordering",
  "Real-Time POS System",
  "E-Commerce Storefront",
  "Telegram Bot Integration",
  "Live Location & Order Tracking",
  "Business Analytics Dashboard",
  "Multiple Menus & Categories",
  "Multiple Business Locations",
  "Custom Branding",
  "Staff Management",
  "24/7 Customer Support",
  "Free Onboarding Assistance",
];

const plans = [
  {
    name: "1 Week",
    duration: "7 Days",
    popular: false,
    label: null,
    description: "Try the full platform free for 7 days. No commitment, no card.",
  },
  {
    name: "1 Month",
    duration: "30 Days",
    popular: true,
    label: "Most Popular",
    description: "The go-to plan for growing businesses ready to operate fully digital.",
  },
  {
    name: "1 Year",
    duration: "365 Days",
    popular: false,
    label: "Best Value",
    description: "Full access all year. Best for established businesses scaling fast.",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-5 text-sm px-4 py-1.5 bg-primary/10 text-primary border-0 font-semibold">
              Pricing
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Every plan gives you full access to every feature — no restrictions.
              Choose the duration that fits your business, and start for free today.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6 mt-16 items-start">
          {plans.map(({ name, duration, popular, label, description }, i) => (
            <FadeIn key={name} direction="up" delay={i * 120}>
              <Card
                className={cn(
                  "relative border-slate-200 transition-all duration-300 flex flex-col",
                  popular
                    ? "border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10"
                    : "hover:border-slate-300 hover:shadow-md"
                )}
              >
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="text-sm px-5 py-1.5 bg-primary text-white border-0 shadow-md font-semibold whitespace-nowrap">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {!popular && label && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="outline" className="text-sm px-5 py-1.5 bg-white border-slate-300 text-slate-600 font-semibold whitespace-nowrap shadow-sm">
                      {label}
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className={cn(
                  "px-8 pt-10 pb-6 border-b",
                  popular ? "bg-primary/5 border-primary/20" : "border-slate-100"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-slate-900">{name}</span>
                    <Badge variant="outline" className="text-sm border-slate-200 text-slate-500 font-medium">
                      {duration}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className={cn("text-6xl font-extrabold", popular ? "text-primary" : "text-slate-900")}>
                      $0
                    </span>
                    <span className="text-xl text-slate-400 mb-3 font-medium">/ free</span>
                  </div>
                  <p className="text-base text-slate-500 leading-relaxed">{description}</p>
                </div>

                {/* Features — same for all plans */}
                <CardContent className="px-8 py-7 flex flex-col flex-1">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Everything Included
                  </p>
                  <ul className="space-y-3 flex-1">
                    {allFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={popular ? "default" : "outline"}
                    className={cn(
                      "w-full h-14 text-xl mt-8 font-semibold",
                      !popular && "border-slate-200 text-slate-700 hover:bg-slate-50"
                    )}
                    asChild
                  >
                    <Link href={ROUTES.PUBLIC.REGISTER}>Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn direction="up" delay={300}>
          <p className="text-center text-base text-slate-400 mt-8">
            All plans include the same full-access features. The only difference is duration.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
