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
  const colors = [
    "from-blue-50 to-blue-100/50",
    "from-purple-50 to-purple-100/50",
    "from-pink-50 to-pink-100/50",
    "from-green-50 to-green-100/50",
    "from-orange-50 to-orange-100/50",
    "from-cyan-50 to-cyan-100/50",
    "from-indigo-50 to-indigo-100/50",
    "from-rose-50 to-rose-100/50"
  ];

  const borderColors = [
    "border-blue-200",
    "border-purple-200",
    "border-pink-200",
    "border-green-200",
    "border-orange-200",
    "border-cyan-200",
    "border-indigo-200",
    "border-rose-200"
  ];

  return (
    <section id="features" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {LANDING_CONFIG.features.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LANDING_CONFIG.features.items.map(({ icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 60}>
              <Card className={`bg-gradient-to-br ${colors[i]} border-2 ${borderColors[i]} hover:shadow-lg transition-all duration-300 h-full group`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary shadow-sm">
                    {iconMap[icon]}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
