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
    color: "bg-amber-100 text-amber-700",
  },
  {
    quote:
      "QR menus eliminated printing costs. Customers love the experience, and setup took less than an hour. Highly recommend.",
    name: "David Chen",
    role: "F&B Manager",
    location: "Siem Reap",
    initials: "DC",
    color: "bg-amber-100 text-amber-700",
  },
  {
    quote:
      "We went live the same day we signed up. Orders came in instantly, analytics showed trends immediately. Simple and powerful.",
    name: "Lin Piseth",
    role: "Café Owner",
    location: "Southeast Asia",
    initials: "LP",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white border-y border-slate-200 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Trusted by Restaurants Globally
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See how restaurants worldwide are transforming their operations with EMenu Platform.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, location, initials, color }, i) => (
            <FadeIn key={name} direction="up" delay={i * 150}>
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-10 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-slate-600 italic flex-1 mb-8">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${color}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{name}</div>
                      <div className="text-sm text-slate-500">{role} • {location}</div>
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
