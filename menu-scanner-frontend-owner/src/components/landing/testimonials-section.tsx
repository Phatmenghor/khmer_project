import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Since switching to eMenu, our order accuracy improved dramatically and customers love the QR experience. Our busiest nights are now completely stress-free!",
    name: "Sokha Nhem",
    role: "Owner, The Green Table",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80",
  },
  {
    quote:
      "Setup was incredibly fast. Within one day all menus were digital and our staff were using it effortlessly. Best decision we made this year.",
    name: "David Chen",
    role: "F&B Director, River Garden",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    quote:
      "The analytics helped us identify our best-selling dishes and adjust strategy. Revenue is up 35% since we started using eMenu.",
    name: "Lin Piseth",
    role: "Manager, La Maison Bistro",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&q=80",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-muted/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by Restaurant Owners
          </h2>
          <p className="text-muted-foreground">
            Hear from businesses who transformed their operations with eMenu.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, role, avatar }) => (
            <Card key={name} className="border-border/60 bg-background">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-9 h-9 rounded-full object-cover border border-border"
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
