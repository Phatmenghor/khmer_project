"use client";

import Link from "next/link";
import { ArrowRight, QrCode, Plus, BarChart3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

const menuItems = [
  { emoji: "🍖", name: "Beef Lok Lak", price: "$8.50" },
  { emoji: "🍚", name: "Khmer Fried Rice", price: "$5.00" },
  { emoji: "🥭", name: "Mango Shake", price: "$3.00" },
];

export default function HeroSection() {
  return (
    <section className="bg-white min-h-[90vh] flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left column */}
          <div className="flex-1 lg:py-28">
            <FadeIn direction="up" delay={0}>
              <Badge
                variant="outline"
                className="text-sm px-4 py-1.5 border-primary/40 text-primary bg-primary/5 font-medium"
              >
                🇰🇭 Trusted by 500+ Businesses in Cambodia
              </Badge>

              <h1 className="text-7xl sm:text-8xl font-extrabold text-slate-900 leading-[1.05] mt-6 tracking-tight">
                Digital Menus.<br />
                <span className="text-primary">Smarter Business.</span>
              </h1>

              <p className="text-xl text-slate-500 mt-6 max-w-lg leading-relaxed">
                EMenu Cambodia helps any food business go fully digital — QR code menus,
                real-time order management, and powerful analytics. Up and running in under an hour.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Button size="lg" className="h-16 px-10 text-xl gap-2 shadow-lg shadow-primary/25" asChild>
                  <Link href={ROUTES.PUBLIC.REGISTER}>
                    Start Free — No Card Needed
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-16 px-10 text-xl border-slate-200 text-slate-700 hover:bg-slate-50" asChild>
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={300}>
              <div className="flex items-center gap-5 mt-10 pt-8 border-t border-slate-100">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-base text-slate-500">
                  <span className="font-semibold text-slate-900">500+ businesses</span> across Cambodia trust EMenu
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Right column — CSS phone mockup */}
          <div className="flex-1 flex items-center justify-center relative py-12">
            {/* Glow */}
            <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Phone frame */}
            <div className="relative z-10">
              <div className="w-[290px] bg-slate-900 rounded-[3.5rem] p-[14px] shadow-2xl ring-1 ring-slate-700/50">
                {/* Notch */}
                <div className="w-24 h-7 bg-slate-800 rounded-full mx-auto mb-2" />
                {/* Screen */}
                <div className="bg-white rounded-[2.8rem] overflow-hidden">
                  {/* App header */}
                  <div className="bg-primary px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-white" />
                      <span className="text-white font-bold text-sm">The Green Table</span>
                    </div>
                    <span className="text-white/70 text-xs">Table 5</span>
                  </div>
                  {/* Category */}
                  <div className="px-4 pt-4 pb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">🔥 Popular Items</p>
                  </div>
                  {/* Menu items */}
                  <div className="px-4 space-y-2.5 pb-3">
                    {menuItems.map((item) => (
                      <div key={item.name} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                          {item.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs font-bold text-primary">{item.price}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cart bar */}
                  <div className="mx-4 mb-5 bg-primary rounded-2xl px-4 py-3 flex items-center justify-between">
                    <span className="text-white text-xs font-medium">3 items</span>
                    <span className="text-white text-xs font-bold">View Cart · $16.50</span>
                  </div>
                </div>
              </div>

              {/* Floating: new order */}
              <div
                className="absolute -top-4 -right-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 min-w-[140px]"
                style={{ animation: "floatBadge 3s ease-in-out infinite" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                  <p className="text-sm font-bold text-slate-900">New Order!</p>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Table 5 · 2 items</p>
              </div>

              {/* Floating: revenue */}
              <div
                className="absolute -bottom-4 -left-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3"
                style={{ animation: "floatBadge 3s ease-in-out infinite 1.5s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Today&apos;s Revenue</p>
                    <p className="text-base font-bold text-slate-900">$1,240</p>
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes floatBadge {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
            `}</style>
          </div>
        </div>
      </div>
    </section>
  );
}
