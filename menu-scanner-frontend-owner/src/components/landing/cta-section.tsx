import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/app-routes/routes";

export default function CtaSection() {
  return (
    <section className="bg-foreground py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />

        <h2 className="text-5xl sm:text-6xl font-bold text-background leading-tight">
          Start Free Today. No Credit Card.
        </h2>

        <p className="text-xl text-background/60 max-w-xl mx-auto mt-4">
          Join 500+ Cambodian restaurants already using EMenu Cambodia to serve
          more guests and grow faster.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Button
            size="lg"
            className="h-16 px-12 text-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <Link href={ROUTES.PUBLIC.REGISTER}>
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 px-12 text-xl border-background/20 text-background hover:bg-background/10"
            asChild
          >
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {[
            "No credit card",
            "Cancel anytime",
            "Free onboarding support",
          ].map((item) => (
            <span
              key={item}
              className="flex items-center gap-2 text-base text-background/60"
            >
              <CheckCircle2 className="w-5 h-5 text-background/60 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
