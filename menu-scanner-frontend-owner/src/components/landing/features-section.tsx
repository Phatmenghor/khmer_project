import { QrCode, ShoppingCart, BarChart3, Send, MapPin, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/landing/fade-in";

const features = [
  {
    icon: QrCode,
    title: "QR Digital Menu",
    description:
      "Generate QR codes for every table. Customers scan to browse your full menu instantly — no app, no friction.",
  },
  {
    icon: Monitor,
    title: "Real-Time POS System",
    description:
      "A complete point-of-sale system built for your business. Manage orders, tables, and payments all from one dashboard.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Storefront",
    description:
      "Sell online with your own branded storefront. Accept online orders and grow your revenue beyond your physical location.",
  },
  {
    icon: Send,
    title: "Telegram Bot Integration",
    description:
      "Receive real-time order notifications and manage your business directly from Telegram. Never miss an order.",
  },
  {
    icon: MapPin,
    title: "Live Location & Tracking",
    description:
      "Track deliveries and locations in real-time. Keep customers informed and your team coordinated at every step.",
  },
  {
    icon: BarChart3,
    title: "Business Analytics Dashboard",
    description:
      "See top items, peak hours, revenue trends, and more. Make smarter decisions with data that updates live every day.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <Badge className="mb-5 text-sm px-4 py-1.5 bg-primary/10 text-primary border-0 font-semibold">
              Full Platform
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Everything Your Business Needs
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              When you register on EMenu Cambodia, you get instant access to the full platform —
              from digital menus to e-commerce, POS, Telegram bot, and live analytics. All included, all free.
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

        {/* Access note */}
        <FadeIn direction="up" delay={200}>
          <div className="mt-14 text-center bg-primary/5 border border-primary/20 rounded-3xl px-8 py-8">
            <p className="text-xl font-semibold text-slate-900">
              🎉 All features above are available on every plan — 1 Week, 1 Month, and 1 Year.
            </p>
            <p className="text-base text-slate-500 mt-2">
              No locked features. No upsells. Register once and access everything immediately.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
