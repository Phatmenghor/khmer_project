import FadeIn from "@/components/landing/fade-in";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function StatsSection() {
  const colors = [
    { gradient: "from-blue-50 via-blue-100/40 to-blue-50", border: "border-blue-300", icon: "🚀", text: "text-blue-600" },
    { gradient: "from-purple-50 via-purple-100/40 to-purple-50", border: "border-purple-300", icon: "📈", text: "text-purple-600" },
    { gradient: "from-pink-50 via-pink-100/40 to-pink-50", border: "border-pink-300", icon: "⭐", text: "text-pink-600" },
    { gradient: "from-green-50 via-green-100/40 to-green-50", border: "border-green-300", icon: "⚡", text: "text-green-600" }
  ];

  return (
    <section className="relative py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "5s"}}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "7s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Real Results from Real Businesses</span>
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {LANDING_CONFIG.stats.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {LANDING_CONFIG.stats.items.map(({ number, label, description }, i) => (
            <FadeIn key={label} direction="up" delay={i * 120}>
              <Card className={`bg-gradient-to-br ${colors[i].gradient} border-2 ${colors[i].border} hover:shadow-2xl hover:scale-105 transition-all duration-300 h-full group relative overflow-hidden`}>
                {/* Animated background dot */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>

                <CardContent className="p-8 text-center relative z-10">
                  <div className="text-5xl mb-3 animate-bounce" style={{animationDelay: `${i * 100}ms`, animationDuration: "2s"}}>
                    {colors[i].icon}
                  </div>
                  <div className={`text-5xl font-bold ${colors[i].text} mb-3`}>{number}</div>
                  <div className="text-base font-bold text-slate-900 mb-2">{label}</div>
                  <div className="text-sm text-slate-700 font-medium">{description}</div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
