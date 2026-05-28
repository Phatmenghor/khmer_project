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
          </div>
        </FadeIn>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Founder photo */}
          <FadeIn direction="right" delay={0}>
            <div className="flex-shrink-0 w-full sm:w-72">
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
                <h3 className="text-2xl font-bold text-slate-900">{founder.name}</h3>
                <p className="text-base text-primary font-semibold mt-2">{founder.title}</p>
                <p className="text-sm text-slate-600 mt-2">{founder.contact.location}</p>
              </div>
            </div>
          </FadeIn>

          {/* Bio and message */}
          <FadeIn direction="left" delay={150}>
            <div className="flex-1">
              <blockquote className="text-xl font-semibold text-slate-700 leading-relaxed border-l-4 border-primary pl-6 mb-6 italic">
                &ldquo;{founder.vision}&rdquo;
              </blockquote>

              <p className="text-base text-slate-600 leading-relaxed mb-6">
                {founder.bio}
              </p>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">
                  Questions or feedback?
                </p>
                <a
                  href={`mailto:${founder.contact.email}`}
                  className="inline-flex text-primary hover:text-primary/80 font-semibold transition-colors"
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
