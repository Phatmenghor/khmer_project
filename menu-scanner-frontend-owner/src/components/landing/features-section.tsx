import { QrCode, ShoppingCart, BarChart3, Users, Trophy, Zap, Lock, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";

const iconMap: Record<string, React.ReactNode> = {
  QrCode: <QrCode className="w-7 h-7" />,
  ShoppingCart: <ShoppingCart className="w-7 h-7" />,
  CreditCard: <CreditCard className="w-7 h-7" />,
  Users: <Users className="w-7 h-7" />,
  Trophy: <Trophy className="w-7 h-7" />,
  Zap: <Zap className="w-7 h-7" />,
  BarChart3: <BarChart3 className="w-7 h-7" />,
  Lock: <Lock className="w-7 h-7" />,
};

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {LANDING_CONFIG.features.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LANDING_CONFIG.features.items.map(({ icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 80}>
              <Card className="border-slate-200 hover:border-amber-700/40 hover:shadow-lg transition-all duration-300 h-full group">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors text-amber-700">
                    {iconMap[icon]}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
