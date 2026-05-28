"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80",
];

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] bg-background flex items-stretch">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
        {/* Left column */}
        <div className="flex-1 pt-40 pb-24 lg:py-32">
          <FadeIn direction="up" delay={0}>
            <Badge
              variant="outline"
              className="text-sm px-4 py-1.5 border-primary/40 text-primary bg-primary/5"
            >
              🇰🇭 Trusted by 500+ Restaurants in Cambodia
            </Badge>

            <h1 className="text-7xl sm:text-8xl font-bold text-foreground leading-tight mt-6">
              Digital Menus for Modern Restaurants
            </h1>

            <p className="text-xl text-muted-foreground mt-6 max-w-lg leading-relaxed">
              EMenu Cambodia helps restaurants go paperless with QR code menus,
              real-time order management, and powerful analytics. Setup in under
              an hour.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button size="lg" className="h-16 px-10 text-xl gap-2" asChild>
                <Link href={ROUTES.PUBLIC.REGISTER}>
                  Start Free — No Card Needed
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 px-10 text-xl"
                asChild
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={400}>
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-2">
                {AVATAR_URLS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Restaurant owner ${i + 1}`}
                    className="w-8 h-8 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <p className="text-base text-muted-foreground">
                Join 500+ restaurants already using EMenu Cambodia
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Right column */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-muted/30 rounded-3xl overflow-hidden h-[600px] lg:min-h-full my-12">
          {/* Restaurant image */}
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80"
            alt="Restaurant interior"
            className="object-cover w-full h-full"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/20 pointer-events-none" />

          {/* Floating order card */}
          <div
            className="absolute bottom-8 left-8 bg-background/95 backdrop-blur rounded-2xl p-5 shadow-2xl border border-border/50"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground">
                  🔔 New Order Received!
                </span>
                <span className="text-sm text-muted-foreground mt-0.5">
                  Table 5 • Beef Lok Lak × 2
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 shrink-0 animate-pulse" />
            </div>
          </div>

          {/* Live badge */}
          <div className="absolute top-8 right-8 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            ⚡ Live &amp; Real-Time
          </div>

          {/* Float keyframe */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
