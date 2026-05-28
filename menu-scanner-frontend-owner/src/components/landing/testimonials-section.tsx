const testimonials = [
  {
    quote:
      "Since switching to eMenu, our order accuracy improved dramatically and customers love the QR experience. Our busiest nights are now stress-free!",
    name: "Sokha Nhem",
    role: "Owner",
    restaurant: "The Green Table Phnom Penh",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80",
    rating: 5,
  },
  {
    quote:
      "Setup was incredibly fast. Within one day all menus were digital and our staff were using it effortlessly. Best decision we made this year.",
    name: "David Chen",
    role: "F&B Director",
    restaurant: "River Garden Restaurant",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    rating: 5,
  },
  {
    quote:
      "The analytics helped us identify best-selling dishes and adjust our menu strategy. Revenue is up 35% since we started using eMenu.",
    name: "Lin Piseth",
    role: "Manager",
    restaurant: "La Maison Bistro",
    avatar:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&q=80",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-amber-400 fill-amber-400"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FDF2F7] text-[#A23469] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#A23469]/20">
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Loved by Restaurant Owners
          </h2>
          <p className="text-lg text-gray-500">
            Join hundreds of restaurants already transforming their business with
            eMenu.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <StarRating count={t.rating} />

              {/* Quote */}
              <p className="text-gray-600 leading-relaxed mt-4 mb-6 flex-1 text-sm">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#A23469]/20"
                />
                <div>
                  <div className="text-sm font-bold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    {t.role}, {t.restaurant}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div className="mt-14 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=80",
                "https://images.unsplash.com/photo-1494790108755-2616b612b494?w=40&q=80",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="User"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                />
              ))}
              <div className="w-9 h-9 rounded-full bg-[#A23469] ring-2 ring-white flex items-center justify-center text-white text-xs font-bold">
                +
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              <span className="text-gray-900 font-bold">500+</span> restaurant
              owners trust eMenu every day
            </p>
            <div className="flex items-center gap-1.5">
              <StarRating count={5} />
              <span className="text-sm font-bold text-gray-900">4.9</span>
              <span className="text-sm text-gray-400">(200+ reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
