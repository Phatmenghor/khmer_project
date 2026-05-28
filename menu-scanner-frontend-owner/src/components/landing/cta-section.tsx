import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/app-routes/routes";

export default function CtaSection() {
  return (
    <section className="bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Transform Your Restaurant?
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Join 500+ restaurants already using eMenu. Start your free 14-day trial today.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            size="lg"
            variant="secondary"
            className="bg-background text-foreground hover:bg-background/90"
            asChild
          >
            <Link href={ROUTES.PUBLIC.REGISTER}>
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <a href="#contact">Schedule a Demo</a>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {["No credit card required", "Cancel anytime", "Free onboarding support"].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-sm text-primary-foreground/70">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground/80" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
