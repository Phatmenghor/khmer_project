import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "@/components/landing/fade-in";

const testimonials = [
  {
    quote:
      "Tables turn faster, staff have more time for guests, and our revenue jumped 40% in 2 months. This platform changed everything.",
    name: "Sopheak Kim",
    role: "Restaurant Owner",
    location: "Phnom Penh",
    initials: "SK",
    color: "bg-primary/20 text-primary",
  },
  {
    quote:
      "QR menus eliminated printing costs. Customers love the experience, and setup took less than an hour. Highly recommend.",
    name: "David Chen",
    role: "F&B Manager",
    location: "Siem Reap",
    initials: "DC",
    color: "bg-primary/20 text-primary",
  },
  {
    quote:
      "We went live the same day we signed up. Orders came in instantly, analytics showed trends immediately. Simple and powerful.",
    name: "Lin Piseth",
    role: "Café Owner",
    location: "Southeast Asia",
    initials: "LP",
    color: "bg-primary/20 text-primary",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/1 to-slate-50"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}}></div>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-11">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Success Stories</span>
            </h2>
            <p className="text-xs text-slate-700 max-w-2xl mx-auto font-medium">
              See how restaurants are transforming operations with Emenu Cambodia.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-4">
          {testimonials.map(({ quote, name, role, location, initials }, i) => (
            <FadeIn key={name} direction="up" delay={i * 140}>
              <Card className="bg-white border-2 border-slate-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full group relative overflow-hidden">
                {/* Animated bg dot */}
                <div className="absolute top-1 right-1 w-14 h-14 bg-primary/5 rounded-full blur-lg group-hover:scale-150 transition-transform duration-300"></div>

                <CardContent className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 italic flex-1 mb-4 font-medium">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-primary/10 text-primary shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{name}</div>
                      <div className="text-xs text-slate-700 font-medium">{role} • {location}</div>
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
