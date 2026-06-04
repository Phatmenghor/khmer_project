import { QrCode, ShoppingCart, BarChart3, Users, Trophy, Zap, Lock, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";

const iconMap: Record<string, React.ReactNode> = {
  QrCode: <QrCode className="w-5 h-5" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />,
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/2 to-slate-50"></div>
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "1s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
        <FadeIn direction="up">
          <div className="text-center mb-11">
            <h2 className="text-xs font-bold text-slate-900 mb-3">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Powerful Features</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {LANDING_CONFIG.features.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANDING_CONFIG.features.items.map(({ icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 80}>
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full group relative overflow-hidden">
                {/* Animated bg dot */}
                <div className="absolute top-1 right-1 w-14 h-14 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300"></div>

                <CardContent className="p-5 relative z-10">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-125 transition-transform text-primary shadow-sm">
                    {iconMap[icon]}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 font-medium">{description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
