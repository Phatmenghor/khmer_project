import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function CtaSection() {
  const { cta } = LANDING_CONFIG;

  return (
    <section className="relative overflow-hidden py-28">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <FadeIn direction="up">
          <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
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
              <Link href="/">{cta.secondaryCTA}</Link>
            </Button>
          </div>

          <div className="mt-10">
            <p className="text-sm text-white/80 text-center">
              {cta.disclaimer}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
