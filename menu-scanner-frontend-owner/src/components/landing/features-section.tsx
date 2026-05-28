import { QrCode, Smartphone, BarChart3, Zap, Globe, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/landing/fade-in";

const features = [
  {
    icon: QrCode,
    title: "Instant QR Menus",
    description:
      "Generate QR codes for every table. Customers scan and browse your full menu instantly — no app download needed.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description:
      "Your menu looks perfect on any device. Optimized for the smartphones your customers already carry.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track top items, peak hours, and revenue trends. Make smarter decisions backed by live data every day.",
  },
  {
    icon: Zap,
    title: "Live Order Updates",
    description:
      "Orders update instantly across all devices. Kitchen, cashier, and manager always stay in perfect sync.",
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
      "Bank-grade security with 99.9% uptime. Your business runs 24/7 without interruptions or data loss.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-5 text-sm px-4 py-1.5 bg-primary/10 text-primary border-0 font-semibold">
              Features
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Everything You Need to Go Digital
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              From QR code menus to real-time analytics — EMenu Cambodia gives your business
              every tool to operate smarter and serve faster.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <FadeIn key={title} direction="up" delay={i * 80}>
              <Card className="border-slate-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full group">
                <CardContent className="p-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-base text-slate-500 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
