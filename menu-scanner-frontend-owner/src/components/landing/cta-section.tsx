import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function CtaSection() {
  const { cta } = LANDING_CONFIG;

  return (
    <section className="bg-primary py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn direction="up">
          <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            {cta.subtitle}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button
              size="lg"
              className="h-14 px-10 text-lg gap-2 bg-white text-primary hover:bg-white/95 shadow-2xl font-bold border-0"
              asChild
            >
              <Link href={ROUTES.PUBLIC.REGISTER}>
                {cta.primaryCTA}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-white/20 text-white hover:bg-white/30 border border-white/40 shadow-none font-semibold"
              asChild
            >
              <a href="#pricing">{cta.secondaryCTA}</a>
            </Button>
          </div>

          <div className="mt-10 pt-10 border-t border-white/20">
            <p className="text-base text-white/90">
              {cta.disclaimer}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
