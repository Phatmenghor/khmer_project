import Image from "next/image";
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

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Founder photo card - Left side */}
          <FadeIn direction="right" delay={100}>
            <Card className="bg-gradient-to-br from-blue-50 via-blue-100/40 to-blue-50 border-2 border-blue-300 h-full group overflow-hidden">
              {/* Animated bg dot */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-300 -mr-16 -mt-16"></div>

              <CardContent className="p-8 relative z-10 h-full flex flex-col">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-white mb-8">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary mb-2">Emenu Cambodia</p>
                    <h3 className="text-3xl font-bold text-slate-900">{founder.name}</h3>
                    <p className="text-lg text-primary font-bold mt-2">{founder.title}</p>
                    <p className="text-base text-slate-700 font-medium mt-2">{founder.contact.location}</p>
                  </div>
                  <a
                    href={`mailto:${founder.contact.email}`}
                    className="inline-flex text-primary hover:text-primary/80 font-semibold transition-colors text-sm justify-center"
                  >
                    {founder.contact.email}
                  </a>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Story cards - Right side */}
          <FadeIn direction="left" delay={150}>
            <div className="space-y-4 h-full flex flex-col">
              {/* Vision Card */}
              <Card className="bg-gradient-to-br from-purple-50 via-purple-100/40 to-purple-50 border-2 border-purple-300 group overflow-hidden flex-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-600/20 mb-4">
                    <span className="text-xl font-bold text-purple-600">💡</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">The Vision</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {founder.vision}
                  </p>
                </CardContent>
              </Card>

              {/* Bio Card */}
              <Card className="bg-gradient-to-br from-pink-50 via-pink-100/40 to-pink-50 border-2 border-pink-300 group overflow-hidden flex-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-pink-600/20 mb-4">
                    <span className="text-xl font-bold text-pink-600">🚀</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Background</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {founder.bio}
                  </p>
                </CardContent>
              </Card>

              {/* Story Card */}
              <Card className="bg-gradient-to-br from-green-50 via-green-100/40 to-green-50 border-2 border-green-300 group overflow-hidden flex-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-300 -mr-12 -mt-12"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-600/20 mb-4">
                    <span className="text-xl font-bold text-green-600">🎯</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Why Emenu Cambodia?</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {founder.story}
                  </p>
                </CardContent>
              </Card>

              {/* Highlights Grid */}
              <div className="grid grid-cols-2 gap-3">
                {founder.highlights.map((highlight, idx) => (
                  <Card key={highlight} className={`bg-gradient-to-br ${
                    idx === 0 ? "from-blue-50 to-blue-100/50 border-blue-200" :
                    idx === 1 ? "from-purple-50 to-purple-100/50 border-purple-200" :
                    idx === 2 ? "from-pink-50 to-pink-100/50 border-pink-200" :
                    "from-green-50 to-green-100/50 border-green-200"
                  } border-2`}>
                    <CardContent className="p-4">
                      <p className="text-xs font-bold text-slate-800 text-center">
                        {highlight}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
