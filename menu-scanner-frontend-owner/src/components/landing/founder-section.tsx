import Image from "next/image";
import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function FounderSection() {
  const founder = LANDING_CONFIG.founder;

  return (
    <section className="bg-white py-32 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-4">
              Meet the Founder
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built by a full-stack engineer with 10+ years of enterprise SaaS experience
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Founder photo */}
          <FadeIn direction="right" delay={0}>
            <div className="flex-shrink-0 w-full sm:w-80">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="text-center mt-8">
                <h3 className="text-3xl font-bold text-slate-900">{founder.name}</h3>
                <p className="text-lg text-amber-700 font-semibold mt-2">{founder.title}</p>
                <p className="text-base text-slate-600 mt-2">{founder.contact.location}</p>
              </div>
            </div>
          </FadeIn>

          {/* Bio and expertise */}
          <FadeIn direction="left" delay={150}>
            <div className="flex-1">
              <blockquote className="text-2xl font-semibold text-slate-700 leading-relaxed border-l-4 border-amber-700 pl-6 mb-8 italic">
                &ldquo;{founder.vision}&rdquo;
              </blockquote>

              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-lg text-slate-600 leading-relaxed">
                  {founder.bio}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-4">Areas of Expertise</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {founder.expertise.map((skill) => (
                    <div key={skill} className="flex items-center gap-3 bg-amber-50 rounded-lg px-4 py-3 border border-amber-200">
                      <div className="w-2 h-2 rounded-full bg-amber-700" />
                      <span className="text-sm font-medium text-slate-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-3">
                  <strong>Get in Touch:</strong>
                </p>
                <a
                  href={`mailto:${founder.contact.email}`}
                  className="text-amber-700 hover:text-amber-800 font-semibold"
                >
                  {founder.contact.email}
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
