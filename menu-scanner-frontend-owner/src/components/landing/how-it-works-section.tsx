import { ChefHat, Utensils, QrCode } from "lucide-react";
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
    <section id="how-it-works" className="bg-white py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              No technical skills needed. Most businesses are fully live within one hour of signing up.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-8 mt-16">
          {steps.map(({ number, icon: Icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 150}>
              <div className="relative bg-white rounded-2xl p-10 border border-slate-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                {/* Decorative number */}
                <div className="absolute top-6 right-8 text-[5rem] font-black text-primary/10 leading-none select-none pointer-events-none">
                  {number}
                </div>
                {/* Icon */}
                <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-md shadow-primary/10 mb-7 text-primary">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-base text-slate-600 leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
