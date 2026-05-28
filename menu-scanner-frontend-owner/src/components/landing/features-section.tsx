import {
  UtensilsCrossed,
  QrCode,
  BarChart3,
  MapPin,
  Users,
  CreditCard,
} from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Smart Menu Builder",
    description:
      "Create stunning digital menus with photos, descriptions, categories and pricing. Update instantly — no reprinting needed.",
  },
  {
    icon: QrCode,
    title: "QR Code Ordering",
    description:
      "Guests scan, browse, and order from their own phone. No app download needed. Fully contactless experience.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track sales, identify top-selling dishes, monitor revenue trends, and make data-driven decisions.",
  },
  {
    icon: MapPin,
    title: "Multi-location Support",
    description:
      "Manage all your restaurant branches from a single unified dashboard with location-specific menus.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Create staff accounts, assign roles, set permissions, and keep your team coordinated efficiently.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Accept cash, ABA, Wing, mobile banking, and card payments. Full transaction history included.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FDF2F7] text-[#A23469] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#A23469]/20">
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Everything Your Restaurant Needs
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Powerful tools to streamline operations, delight customers, and grow your
            business.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative bg-white rounded-2xl p-7 border border-gray-100 hover:border-[#A23469]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#FDF2F7] flex items-center justify-center mb-5 group-hover:bg-[#A23469] transition-colors duration-300">
                <Icon className="w-6 h-6 text-[#A23469] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>

              {/* Hover accent */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#A23469] to-[#D56B9E] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
