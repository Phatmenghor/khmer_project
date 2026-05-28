import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "@/components/landing/fade-in";

const testimonials = [
  {
    quote:
      "Since switching to EMenu Cambodia, our tables turn faster and our staff have more time to focus on guests. Revenue is up 40% in just 2 months!",
    name: "Sopheak Kim",
    role: "Owner",
    location: "Malis Restaurant, Phnom Penh",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    quote:
      "The QR menus have completely eliminated printing costs. Our international tourists especially love it — the bilingual support is perfect.",
    name: "David Chen",
    role: "F&B Manager",
    location: "River Garden Resort, Siem Reap",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&q=80",
  },
  {
    quote:
      "Setup took less than one hour. We scanned the QR codes at our tables the same day and were already taking digital orders by dinnertime.",
    name: "Lin Piseth",
    role: "Manager",
    location: "La Maison Bistro, Kampot",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-muted/40 border-y border-border py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-5">
              Loved Across Cambodia
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from restaurant owners who transformed their operations with
              EMenu Cambodia.
            </p>
          </div>
        </FadeIn>

        {/* Testimonial cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16">
          {testimonials.map(({ quote, name, role, location, avatar }, i) => (
            <FadeIn key={name} direction="up" delay={i * 150}>
              <Card className="bg-background border-border/60 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-10">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-5 h-5 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-base leading-relaxed text-muted-foreground italic mb-6">
                    &ldquo;{quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover flex-shrink-0"
                    />
                    <div>
                      <div className="text-xl font-semibold text-foreground">
                        {name}
                      </div>
                      <div className="text-base text-muted-foreground">
                        {role} — {location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
