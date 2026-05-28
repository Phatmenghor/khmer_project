import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function StatsSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {LANDING_CONFIG.stats.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {LANDING_CONFIG.stats.items.map(({ number, label, description }, i) => (
            <FadeIn key={label} direction="up" delay={i * 100}>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-3">{number}</div>
                <div className="text-lg font-semibold text-slate-900 mb-1">{label}</div>
                <div className="text-sm text-slate-600">{description}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
