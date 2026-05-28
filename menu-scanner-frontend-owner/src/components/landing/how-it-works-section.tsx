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
  return (
    <section id="how-it-works" className="relative py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "5s"}}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "7s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Get Started in 3 Steps</span>
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
              No technical skills needed. Most businesses are fully live in minutes.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6 mt-16">
          {steps.map(({ number, icon: Icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 140}>
              <Card className="relative bg-white border-2 border-slate-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full group overflow-hidden">
                {/* Animated bg dot */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-14 -mt-14"></div>

                <CardContent className="p-8 relative z-10">
                  {/* Decorative number */}
                  <div className="text-6xl font-black text-primary/10 leading-none select-none pointer-events-none mb-2">
                    {number}
                  </div>
                  {/* Icon */}
                  <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-125 transition-transform text-primary shadow-sm">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">{description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
