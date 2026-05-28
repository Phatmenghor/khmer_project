import { ChefHat, Utensils, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/landing/fade-in";

const steps = [
  {
    number: "1",
    icon: ChefHat,
    title: "Register Your Restaurant",
    description:
      "Sign up free, enter your restaurant details, and get your account ready in minutes.",
  },
  {
    number: "2",
    icon: Utensils,
    title: "Build Your Digital Menu",
    description:
      "Add your dishes, photos, prices, and categories. Organize your menu exactly how you want it.",
  },
  {
    number: "3",
    icon: QrCode,
    title: "Start Accepting Orders",
    description:
      "Print your QR codes, place them on tables, and watch orders come in — all in real-time.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <Badge variant="outline" className="text-sm px-4 py-1.5 mb-6">
              Simple Setup
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-5">
              Up and Running in Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your restaurant experience.
            </p>
          </div>
        </FadeIn>

        {/* Steps */}
        <div className="grid sm:grid-cols-3 gap-8 mt-16">
          {steps.map(({ number, icon: Icon, title, description }, i) => (
            <FadeIn key={number} direction="up" delay={i * 150}>
              <div className="relative text-center sm:text-left">
                {/* Decorative number */}
                <span className="text-[8rem] font-black text-primary/5 absolute top-0 right-4 leading-none select-none pointer-events-none">
                  {number}
                </span>

                {/* Icon */}
                <div className="relative z-10 inline-flex sm:flex w-16 h-16 rounded-2xl bg-primary items-center justify-center shadow-lg">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mt-6 mb-3 relative z-10">
                  {title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed relative z-10">
                  {description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
