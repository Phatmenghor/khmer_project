import {
  QrCode,
  Smartphone,
  BarChart3,
  Zap,
  Globe,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/landing/fade-in";

const features = [
  {
    icon: QrCode,
    title: "Instant QR Menus",
    description:
      "Generate QR codes for every table. Customers scan and browse your full menu instantly—no app needed.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description:
      "Your menu looks beautiful on any device. Optimized for the smartphones your customers already use.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track top dishes, peak hours, and revenue trends. Make smarter decisions backed by live data.",
  },
  {
    icon: Zap,
    title: "Live Order Updates",
    description:
      "Orders update in real-time across all devices. Kitchen, cashier, and manager stay perfectly in sync.",
  },
  {
    icon: Globe,
    title: "Khmer & English",
    description:
      "Full bilingual support for Khmer and English. Serve local and international guests with equal ease.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Bank-grade security with 99.9% uptime. Your business runs 24/7 without interruption.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <Badge variant="outline" className="text-sm px-4 py-1.5 mb-6">
              Features
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-5">
              Everything Your Restaurant Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to streamline operations, delight customers, and grow your business across Cambodia.
            </p>
          </div>
        </FadeIn>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {features.map(({ icon: Icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 100}>
              <Card className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 h-full">
                <CardContent className="p-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mt-5 mb-3">
                    {title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
