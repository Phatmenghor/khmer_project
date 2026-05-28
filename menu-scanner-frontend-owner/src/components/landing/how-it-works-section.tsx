import { UserPlus, ChefHat, Share2, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up in 5 minutes. Enter your restaurant details, choose a plan, and you're in.",
  },
  {
    number: "02",
    icon: ChefHat,
    title: "Build Your Menu",
    description: "Add categories and dishes, upload photos, set prices. We'll make it look beautiful.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Share QR Codes",
    description: "Print or display your unique QR codes on tables. Guests scan and browse instantly.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Manage & Grow",
    description: "Accept orders, track performance, respond to trends, and watch your revenue grow.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Up and Running in Minutes
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Four simple steps to transform your restaurant experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="text-center">
              <div className="relative inline-flex mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {number.replace("0", "")}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
