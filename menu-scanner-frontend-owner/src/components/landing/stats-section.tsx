import FadeIn from "@/components/landing/fade-in";

const stats = [
  { value: "500+", label: "Businesses Active" },
  { value: "50,000+", label: "Orders Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 1hr", label: "Average Setup Time" },
];

export default function StatsSection() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <FadeIn key={label} direction="up" delay={i * 100}>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-3">{value}</div>
                <div className="text-xl text-white/50 font-medium">{label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
