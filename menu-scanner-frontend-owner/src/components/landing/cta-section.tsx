import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

export default function CtaSection() {
  return (
    <section className="bg-primary py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn direction="up">
          <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-5">
            Start Free Today.<br />No Credit Card Needed.
          </h2>
          <p className="text-xl text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
            Join 500+ Cambodian businesses already using EMenu Cambodia to serve
            more customers and grow faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="h-16 px-12 text-xl gap-2 bg-white text-primary hover:bg-white/90 shadow-xl font-bold"
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
              className="h-16 px-12 text-xl border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <a href="#pricing">View Plans</a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {["No credit card", "Cancel anytime", "Free onboarding support"].map((item) => (
              <span key={item} className="flex items-center gap-2 text-base text-white/70">
                <CheckCircle2 className="w-5 h-5 text-white/80 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
