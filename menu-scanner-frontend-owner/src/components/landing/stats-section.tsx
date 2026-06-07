import FadeIn from "@/components/landing/fade-in";
import { Card, CardContent } from "@/components/ui/card";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function StatsSection() {
  return (
    <section className="relative py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "5s"}}></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "7s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
        <FadeIn direction="up">
          <div className="text-center mb-11">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Real Results from Real Businesses</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {LANDING_CONFIG.stats.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {LANDING_CONFIG.stats.items.map(({ number, label, description }, i) => (
            <FadeIn key={label} direction="up" delay={i * 120}>
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full group relative overflow-hidden">
                {/* Animated background dot */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-8 -mt-8"></div>

                <CardContent className="p-5 text-center relative z-10">
                  <div className="text-xs font-bold text-primary mb-2">{number}</div>
                  <div className="text-xs font-bold text-slate-900 mb-1">{label}</div>
                  <div className="text-xs text-slate-700 font-medium">{description}</div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
