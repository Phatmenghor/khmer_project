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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Meet the Founder</span>
            </h2>
            <p className="text-lg text-slate-700 font-medium">The vision behind EMenu Platform</p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Founder photo card */}
          <FadeIn direction="right" delay={100}>
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-white">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="text-center mt-8">
                  <h3 className="text-2xl font-bold text-slate-900">{founder.name}</h3>
                  <p className="text-base text-primary font-semibold mt-2">{founder.title}</p>
                  <p className="text-sm text-slate-600 mt-2">{founder.contact.location}</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Story cards */}
          <FadeIn direction="left" delay={150}>
            <div className="space-y-6">
              {/* Vision Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 mb-4">
                    <span className="text-lg font-bold text-primary">💡</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">The Vision</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {founder.vision}
                  </p>
                </CardContent>
              </Card>

              {/* Bio Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 mb-4">
                    <span className="text-lg font-bold text-primary">🚀</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Background</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {founder.bio}
                  </p>
                </CardContent>
              </Card>

              {/* Story Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 mb-4">
                    <span className="text-lg font-bold text-primary">🎯</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Why EMenu?</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {founder.story}
                  </p>
                </CardContent>
              </Card>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-3">
                {founder.highlights.map((highlight) => (
                  <Card key={highlight} className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-slate-700 text-center">
                        {highlight}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Card */}
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-slate-600 mb-3">Questions? Let's talk</p>
                  <a
                    href={`mailto:${founder.contact.email}`}
                    className="inline-flex text-primary hover:text-primary/80 font-semibold transition-colors text-sm"
                  >
                    {founder.contact.email}
                  </a>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
