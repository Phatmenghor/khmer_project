import { UserPlus, ChefHat, Share2, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in 5 minutes. Enter your restaurant details, choose a plan, and you're in.",
  },
  {
    number: "2",
    icon: ChefHat,
    title: "Build Your Menu",
    description:
      "Add categories and dishes, upload photos, set prices. We'll make it look beautiful.",
  },
  {
    number: "3",
    icon: Share2,
    title: "Share QR Codes",
    description:
      "Print or display your unique QR codes on tables. Guests scan and browse your menu instantly.",
  },
  {
    number: "4",
    icon: TrendingUp,
    title: "Manage & Grow",
    description:
      "Accept orders, track performance, respond to trends, and watch your revenue grow.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#FDF2F7] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-[#A23469] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#A23469]/20">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Up and Running in Minutes
          </h2>
          <p className="text-lg text-gray-500">
            Four simple steps to transform your restaurant experience.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting dotted line — desktop only */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-[#A23469]/20 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <div key={title} className="text-center group">
                {/* Numbered circle */}
                <div className="relative inline-flex">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#A23469] flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 mb-5">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[#A23469] flex items-center justify-center">
                    <span className="text-xs font-extrabold text-[#A23469]">
                      {number}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
