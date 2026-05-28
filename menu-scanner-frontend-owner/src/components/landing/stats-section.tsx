const stats = [
  { value: "500+", label: "Active Restaurants" },
  { value: "1M+", label: "Orders Processed" },
  { value: "50+", label: "Cities Covered" },
  { value: "99.9%", label: "Platform Uptime" },
];

export default function StatsSection() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl lg:text-5xl font-extrabold text-[#A23469] mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm lg:text-base text-gray-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
