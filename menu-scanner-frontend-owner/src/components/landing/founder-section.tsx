import { Badge } from "@/components/ui/badge";
import { Code2, Heart, Rocket } from "lucide-react";
import FadeIn from "@/components/landing/fade-in";

const values = [
  {
    icon: Code2,
    title: "Built by a Developer",
    text: "Every feature is engineered with real business needs in mind — not just theory.",
  },
  {
    icon: Heart,
    title: "Made for Cambodia",
    text: "Designed specifically for Cambodian businesses, culture, and the way we work.",
  },
  {
    icon: Rocket,
    title: "Always Growing",
    text: "New features are continuously being developed. This platform will only get better.",
  },
];

export default function FounderSection() {
  return (
    <section className="bg-slate-50 py-32 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-5 text-sm px-4 py-1.5 bg-primary/10 text-primary border-0 font-semibold">
              Our Story
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Built for Cambodia, by Cambodia
            </h2>
          </div>
        </FadeIn>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Founder card */}
          <FadeIn direction="right" delay={0}>
            <div className="flex-shrink-0 text-center">
              {/* Avatar */}
              <div className="relative mx-auto w-52 h-52 mb-6">
                <div className="w-52 h-52 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-2xl">
                  <span className="text-7xl font-black text-primary select-none">PM</span>
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Phat Menghor</h3>
              <p className="text-xl text-primary font-semibold mt-1">Founder & Software Developer</p>
              <p className="text-base text-slate-400 mt-1">🇰🇭 Phnom Penh, Cambodia</p>
            </div>
          </FadeIn>

          {/* Story text */}
          <FadeIn direction="left" delay={150}>
            <div className="flex-1">
              <blockquote className="text-2xl font-semibold text-slate-700 leading-relaxed border-l-4 border-primary pl-6 mb-8 italic">
                &ldquo;I built EMenu Cambodia because I believe every Cambodian business —
                big or small — deserves access to world-class digital tools at the best price.&rdquo;
              </blockquote>

              <p className="text-xl text-slate-500 leading-relaxed mb-5">
                As a software developer passionate about Cambodia&apos;s growth, I created EMenu Cambodia
                to solve real problems for local businesses. From QR menus to full POS systems,
                e-commerce storefronts, and Telegram bots — everything is designed to be simple,
                powerful, and affordable for Cambodian business owners.
              </p>

              <p className="text-xl text-slate-500 leading-relaxed">
                This is just the beginning. More features are always in development —
                including advanced HR tools, delivery management, and loyalty programs.
                EMenu Cambodia will grow with your business.
              </p>

              {/* Value pills */}
              <div className="grid sm:grid-cols-3 gap-4 mt-10">
                {values.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-base font-bold text-slate-900 mb-1">{title}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
