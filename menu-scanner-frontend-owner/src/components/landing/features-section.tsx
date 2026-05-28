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
    { gradient: "from-blue-50 via-blue-100/30 to-blue-50", border: "border-blue-300", text: "text-blue-600" },
    { gradient: "from-purple-50 via-purple-100/30 to-purple-50", border: "border-purple-300", text: "text-purple-600" },
    { gradient: "from-pink-50 via-pink-100/30 to-pink-50", border: "border-pink-300", text: "text-pink-600" },
    { gradient: "from-green-50 via-green-100/30 to-green-50", border: "border-green-300", text: "text-green-600" },
    { gradient: "from-orange-50 via-orange-100/30 to-orange-50", border: "border-orange-300", text: "text-orange-600" },
    { gradient: "from-cyan-50 via-cyan-100/30 to-cyan-50", border: "border-cyan-300", text: "text-cyan-600" },
    { gradient: "from-indigo-50 via-indigo-100/30 to-indigo-50", border: "border-indigo-300", text: "text-indigo-600" },
    { gradient: "from-rose-50 via-rose-100/30 to-rose-50", border: "border-rose-300", text: "text-rose-600" }
  ];

  return (
    <section id="features" className="relative py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/2 to-slate-50"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "1s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Powerful Features</span>
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
              {LANDING_CONFIG.features.subtitle}
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LANDING_CONFIG.features.items.map(({ icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 80}>
              <Card className={`bg-gradient-to-br ${colors[i].gradient} border-2 ${colors[i].border} hover:shadow-2xl hover:scale-105 transition-all duration-300 h-full group relative overflow-hidden`}>
                {/* Animated bg dot */}
                <div className="absolute top-2 right-2 w-20 h-20 bg-white/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300"></div>

                <CardContent className="p-7 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-5 group-hover:scale-125 transition-transform text-primary shadow-md ${colors[i].text}`}>
                    {iconMap[icon]}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 font-medium">{description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
