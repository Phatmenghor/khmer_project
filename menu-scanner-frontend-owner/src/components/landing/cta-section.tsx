import Link from "next/link";
import { ArrowRight, CheckCircle2, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

export default function CtaSection() {
  return (
    <section className="bg-primary py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn direction="up">
          {/* Support badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-5 py-2 mb-8">
            <HeadphonesIcon className="w-5 h-5 text-white" />
            <span className="text-base font-semibold text-white">24/7 Support — Always Here for You</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-5">
            Start Free Today.
            <br />
            <span className="text-white/90">No Credit Card Needed.</span>
          </h2>

          <p className="text-xl text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Join businesses across Cambodia already using EMenu Cambodia —
            full platform access, every feature included, completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="h-16 px-12 text-xl gap-2 bg-white text-primary hover:bg-white/95 shadow-2xl font-bold border-0"
              asChild
            >
              <Link href={ROUTES.PUBLIC.REGISTER}>
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="h-16 px-12 text-xl bg-white/10 text-white hover:bg-white/20 border border-white/30 shadow-none font-semibold"
              asChild
            >
              <a href="#pricing">View Plans</a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 mt-12">
            {[
              "No credit card required",
              "Cancel anytime",
              "Free onboarding support",
              "24/7 customer support",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2 text-base text-white/80">
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
