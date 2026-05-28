import FadeIn from "@/components/landing/fade-in";

const stats = [
  { value: "500+", label: "Restaurants Active" },
  { value: "50,000+", label: "Orders Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 1hr", label: "Average Setup Time" },
];

export default function StatsSection() {
  return (
    <section className="bg-foreground text-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <FadeIn key={label} direction="up" delay={i * 100}>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {value}
                </div>
                <div className="text-xl text-background/60">{label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
