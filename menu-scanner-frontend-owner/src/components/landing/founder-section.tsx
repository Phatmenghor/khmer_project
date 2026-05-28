import Image from "next/image";
import { Globe, Briefcase, UtensilsCrossed, Zap } from "lucide-react";
import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";
import { Card, CardContent } from "@/components/ui/card";

export default function FounderSection() {
  const founder = LANDING_CONFIG.founder;

  return (
    <section className="relative py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/2 to-slate-50"></div>
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Meet the Founder</span>
            </h2>
            <p className="text-lg text-slate-700 font-medium">The vision behind Emenu Cambodia</p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Founder photo card - Left side */}
          <FadeIn direction="right" delay={100}>
            <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
              {/* Animated bg dot */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-16 -mt-16"></div>

              <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10 flex flex-col">
                <div className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden shadow-lg bg-white mb-4 sm:mb-6 lg:mb-8">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{founder.name}</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p className="text-slate-700">{founder.title}</p>
                    <p className="text-slate-700">{founder.contact.location}</p>
                    <p>
                      <a
                        href={`mailto:${founder.contact.email}`}
                        className="text-primary hover:text-primary/80 transition-colors text-slate-700 hover:text-primary break-all"
                      >
                        {founder.contact.email}
                      </a>
                    </p>
                    <p>
                      <a
                        href={founder.contact.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors text-slate-700 hover:text-primary"
                      >
                        {founder.contact.social}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Story cards and highlights - Right side */}
          <FadeIn direction="left" delay={150}>
            <div className="space-y-4 flex flex-col">
              {/* Vision Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>
                <CardContent className="p-7 relative z-10 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">The Vision</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {founder.vision}
                  </p>
                </CardContent>
              </Card>

              {/* Bio Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>
                <CardContent className="p-7 relative z-10 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Background</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {founder.bio}
                  </p>
                </CardContent>
              </Card>

              {/* Story Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>
                <CardContent className="p-7 relative z-10 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Why Emenu Cambodia?</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {founder.story}
                  </p>
                </CardContent>
              </Card>

              {/* Highlights Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>
                <CardContent className="p-7 relative z-10 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-900 mb-5">Highlights</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 font-medium">{founder.highlights[0]}</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Briefcase className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 font-medium">{founder.highlights[1]}</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <UtensilsCrossed className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 font-medium">{founder.highlights[2]}</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 font-medium">{founder.highlights[3]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
