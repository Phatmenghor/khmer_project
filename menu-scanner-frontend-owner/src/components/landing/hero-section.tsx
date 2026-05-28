"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShoppingBag, TrendingUp, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle background decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FDF2F7] rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#FDF2F7] rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left — Text */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FDF2F7] border border-[#A23469]/20 text-[#A23469] text-sm font-medium mb-6">
              <span className="text-base">🚀</span>
              Trusted by 500+ Restaurants in Cambodia
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              Your Restaurant,{" "}
              <span className="bg-gradient-to-r from-[#A23469] to-[#D56B9E] bg-clip-text text-transparent">
                Powered by Smart
              </span>{" "}
              Digital Menus
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl">
              Boost sales, reduce wait times, and delight guests with QR code ordering,
              real-time management, and powerful analytics — all in one platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#A23469] text-white font-semibold text-base hover:bg-[#802A54] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-[#A23469] text-[#A23469] font-semibold text-base hover:bg-[#FDF2F7] transition-all duration-200"
              >
                See Demo
              </a>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
              {["No credit card required", "14-day free trial", "Cancel anytime"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#A23469] flex-shrink-0" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="relative animate-fade-in">
            {/* Main card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Restaurant image */}
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
                alt="Restaurant"
                className="w-full h-72 lg:h-80 object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/80 via-[#1a1a2e]/20 to-transparent" />

              {/* Dashboard overlay card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Today&apos;s Overview
                  </span>
                  <span className="text-xs text-[#A23469] font-medium">Live</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Orders", value: "124", icon: ShoppingBag, up: true },
                    { label: "Revenue", value: "$1,840", icon: TrendingUp, up: true },
                    { label: "Rating", value: "4.9", icon: Star, up: false },
                  ].map(({ label, value, icon: Icon, up }) => (
                    <div key={label} className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Icon className="w-3.5 h-3.5 text-[#A23469]" />
                      </div>
                      <div className="text-base font-bold text-gray-900">{value}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                      {up && (
                        <div className="text-xs text-green-600 font-medium">+12%</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge — New Orders */}
            <div className="absolute -top-4 -right-4 bg-[#A23469] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              12 New Orders
            </div>

            {/* Floating QR badge */}
            <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl border border-gray-100 p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FDF2F7] rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-[2px] ${
                        [0, 2, 4, 6, 8].includes(i) ? "bg-[#A23469]" : "bg-[#A23469]/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">QR Ready</div>
                <div className="text-xs text-gray-500">Table 7</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
