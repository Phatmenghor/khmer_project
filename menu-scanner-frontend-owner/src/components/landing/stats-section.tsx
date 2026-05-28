import FadeIn from "@/components/landing/fade-in";
import { Card, CardContent } from "@/components/ui/card";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function StatsSection() {
  const colors = [
    "from-blue-50 to-blue-100/50 border-blue-200",
    "from-purple-50 to-purple-100/50 border-purple-200",
    "from-pink-50 to-pink-100/50 border-pink-200",
    "from-green-50 to-green-100/50 border-green-200"
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Real Results</h2>
            <p className="text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {LANDING_CONFIG.stats.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {LANDING_CONFIG.stats.items.map(({ number, label, description }, i) => (
            <FadeIn key={label} direction="up" delay={i * 100}>
              <Card className={`bg-gradient-to-br ${colors[i]} border-2 hover:shadow-lg transition-all duration-300 h-full`}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{number}</div>
                  <div className="text-sm font-bold text-slate-900 mb-2">{label}</div>
                  <div className="text-xs text-slate-600">{description}</div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
