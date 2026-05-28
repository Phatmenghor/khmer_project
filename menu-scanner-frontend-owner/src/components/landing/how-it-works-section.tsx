import { ChefHat, Utensils, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "@/components/landing/fade-in";

const steps = [
  {
    number: "01",
    icon: ChefHat,
    title: "Register Your Business",
    description:
      "Sign up free, enter your business details, and get your account ready in minutes. No credit card required.",
  },
  {
    number: "02",
    icon: Utensils,
    title: "Build Your Digital Menu",
    description:
      "Add your items, prices, and categories. Upload photos, write descriptions, and organize your menu exactly how you want.",
  },
  {
    number: "03",
    icon: QrCode,
    title: "Go Live & Take Orders",
    description:
      "Print your QR codes, place them on tables, and start receiving real-time orders instantly. Setup done.",
  },
];

export default function HowItWorksSection() {
  const colors = [
    "from-blue-50 to-blue-100/50 border-blue-200",
    "from-purple-50 to-purple-100/50 border-purple-200",
    "from-pink-50 to-pink-100/50 border-pink-200"
  ];

  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Get Started in 3 Steps
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              No technical skills needed. Most businesses are fully live in minutes.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {steps.map(({ number, icon: Icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 120}>
              <Card className={`relative bg-gradient-to-br ${colors[i]} border-2 hover:shadow-lg transition-all duration-300 h-full`}>
                <CardContent className="p-6">
                  {/* Decorative number */}
                  <div className="text-4xl font-black text-primary/10 leading-none select-none pointer-events-none mb-4">
                    {number}
                  </div>
                  {/* Icon */}
                  <div className="relative w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-5 text-primary shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
