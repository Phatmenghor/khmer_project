import {
  UtensilsCrossed,
  QrCode,
  BarChart3,
  MapPin,
  Users,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Smart Menu Builder",
    description:
      "Create stunning digital menus with photos, descriptions, categories, and pricing. Update instantly — no reprinting needed.",
  },
  {
    icon: QrCode,
    title: "QR Code Ordering",
    description:
      "Guests scan, browse, and order from their own phone. No app download needed. Fully contactless experience.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track sales, identify top-selling dishes, monitor revenue trends, and make data-driven business decisions.",
  },
  {
    icon: MapPin,
    title: "Multi-location Support",
    description:
      "Manage all your restaurant branches from a single unified dashboard with location-specific menus and reports.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Create staff accounts, assign roles, set permissions, and keep your team coordinated effortlessly.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Accept cash, ABA, Wing, mobile banking, and card payments with full transaction history included.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything Your Restaurant Needs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to streamline operations, delight customers, and grow your business.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
