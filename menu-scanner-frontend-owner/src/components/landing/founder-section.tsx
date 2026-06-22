import Image from "next/image";
import { Globe, Briefcase, UtensilsCrossed, Zap } from "lucide-react";
import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";
import { Card, CardContent } from "@/components/ui/card";

export default function FounderSection() {
  const founder = LANDING_CONFIG.founder;

  return (
    <section className="relative py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/2 to-slate-50"></div>
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
        <FadeIn direction="up">
          <div className="text-center mb-11">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Meet the Founder</span>
            </h2>
            <p className="text-xs text-slate-700 font-medium">The vision behind ScanMeKH</p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Founder photo card - Left side */}
          <FadeIn direction="right" delay={100}>
            <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
              {/* Animated bg dot */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-11 -mt-11"></div>

              <CardContent className="p-3 sm:p-4 lg:p-5 relative z-10 flex flex-col">
                <div className="relative aspect-video sm:aspect-square rounded overflow-hidden shadow-lg bg-white mb-3 sm:mb-4 lg:mb-5">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{founder.name}</h3>
                  <div className="space-y-1 sm:space-y-1 text-xs sm:text-xs">
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
            <div className="space-y-3 flex flex-col">
              {/* Vision Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-8 -mt-8"></div>
                <CardContent className="p-5 relative z-10 flex flex-col">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">The Vision</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {founder.vision}
                  </p>
                </CardContent>
              </Card>

              {/* Bio Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-8 -mt-8"></div>
                <CardContent className="p-5 relative z-10 flex flex-col">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Background</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {founder.bio}
                  </p>
                </CardContent>
              </Card>

              {/* Story Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-8 -mt-8"></div>
                <CardContent className="p-5 relative z-10 flex flex-col">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Why ScanMeKH?</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {founder.story}
                  </p>
                </CardContent>
              </Card>

              {/* Highlights Card */}
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-8 -mt-8"></div>
                <CardContent className="p-5 relative z-10 flex flex-col">
                  <h4 className="text-xs font-bold text-slate-900 mb-3">Highlights</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-start">
                      <Globe className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 font-medium">{founder.highlights[0]}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Briefcase className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 font-medium">{founder.highlights[1]}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <UtensilsCrossed className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 font-medium">{founder.highlights[2]}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Zap className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 font-medium">{founder.highlights[3]}</p>
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
