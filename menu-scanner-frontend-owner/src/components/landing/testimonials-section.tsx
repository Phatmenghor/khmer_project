import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "@/components/landing/fade-in";

const testimonials = [
  {
    quote:
      "Since switching to EMenu Cambodia, our tables turn faster and staff have more time for guests. Revenue is up 40% in just 2 months!",
    name: "Sopheak Kim",
    role: "Owner",
    location: "Malis Restaurant, Phnom Penh",
    initials: "SK",
    color: "bg-violet-100 text-violet-700",
  },
  {
    quote:
      "The QR menus eliminated all printing costs. Our international tourists especially love it — the bilingual support is perfect.",
    name: "David Chen",
    role: "F&B Manager",
    location: "River Garden Resort, Siem Reap",
    initials: "DC",
    color: "bg-sky-100 text-sky-700",
  },
  {
    quote:
      "Setup took under an hour. We scanned QR codes at our tables the same day and were already taking digital orders by dinnertime.",
    name: "Lin Piseth",
    role: "Manager",
    location: "La Maison Bistro, Kampot",
    initials: "LP",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-slate-50 border-y border-slate-200 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Loved Across Cambodia
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Hear from business owners who transformed their operations with EMenu Cambodia.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, location, initials, color }, i) => (
            <FadeIn key={name} direction="up" delay={i * 150}>
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-10 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-slate-500 italic flex-1 mb-8">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${color}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-slate-900">{name}</div>
                      <div className="text-base text-slate-400">{role} — {location}</div>
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
