import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#A23469] to-[#802A54]" />

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium mb-6 border border-white/20">
          <span className="mr-2">🎉</span>
          Limited time — Start free today
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
          Ready to Transform
          <br />
          Your Restaurant?
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join 500+ restaurants already using eMenu. Start your free 14-day
          trial today — no credit card needed.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#A23469] font-bold text-base hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/50 text-white font-semibold text-base hover:bg-white/10 hover:border-white transition-all duration-200"
          >
            Schedule a Demo
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
          {[
            "No credit card required",
            "Cancel anytime",
            "Free onboarding support",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white/80 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
