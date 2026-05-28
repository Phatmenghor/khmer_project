const stats = [
  { value: "500+", label: "Active Restaurants" },
  { value: "1M+", label: "Orders Processed" },
  { value: "50+", label: "Cities Covered" },
  { value: "99.9%", label: "Platform Uptime" },
];

export default function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
                {value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
