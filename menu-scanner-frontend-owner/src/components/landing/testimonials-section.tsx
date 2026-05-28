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
  const colors = [
    "from-blue-50 to-blue-100/50 border-blue-200",
    "from-purple-50 to-purple-100/50 border-purple-200",
    "from-pink-50 to-pink-100/50 border-pink-200"
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Success Stories
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              See how restaurants are transforming operations with EMenu Platform.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, role, location, initials, color }, i) => (
            <FadeIn key={name} direction="up" delay={i * 120}>
              <Card className={`bg-gradient-to-br ${colors[i]} border-2 hover:shadow-lg transition-all duration-300 h-full`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 italic flex-1 mb-6">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{name}</div>
                      <div className="text-xs text-slate-600">{role} • {location}</div>
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
