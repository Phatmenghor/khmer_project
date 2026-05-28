"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

type BillingPeriod = "monthly" | "yearly";

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  monthlyPrice: string | number;
  yearlyPrice: string | number;
  subtitle: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  badge?: string;
  priceLabel?: string;
}

const plans: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 23,
    subtitle: "Perfect for small restaurants",
    features: [
      { text: "1 Restaurant Location" },
      { text: "Up to 50 Menu Items" },
      { text: "QR Code Menu" },
      { text: "Basic Order Management" },
      { text: "Email Support" },
      { text: "5 Staff Accounts" },
    ],
    cta: "Start Free Trial",
    ctaHref: "/register",
    highlighted: false,
  },
  {
    name: "Professional",
    monthlyPrice: 79,
    yearlyPrice: 63,
    subtitle: "For growing restaurants & chains",
    features: [
      { text: "Up to 5 Locations" },
      { text: "Unlimited Menu Items" },
      { text: "Advanced Analytics Dashboard" },
      { text: "Real-time Order Notifications" },
      { text: "Staff & Role Management" },
      { text: "Priority Support (24/7)" },
      { text: "Custom Branding" },
      { text: "20 Staff Accounts" },
    ],
    cta: "Get Started",
    ctaHref: "/register",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    subtitle: "For large chains & enterprises",
    features: [
      { text: "Unlimited Locations" },
      { text: "Everything in Professional" },
      { text: "Dedicated Account Manager" },
      { text: "Custom Integrations & API" },
      { text: "SLA Guarantee (99.9%)" },
      { text: "On-site Training" },
      { text: "Unlimited Staff Accounts" },
    ],
    cta: "Contact Sales",
    ctaHref: "/register",
    highlighted: false,
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const getPrice = (plan: Plan) => {
    const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    if (typeof price === "string") return price;
    return `$${price}`;
  };

  return (
    <section id="pricing" className="bg-white py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FDF2F7] text-[#A23469] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#A23469]/20">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium transition-colors ${
              billing === "monthly" ? "text-gray-900" : "text-gray-400"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))
            }
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
              billing === "yearly" ? "bg-[#A23469]" : "bg-gray-200"
            }`}
            aria-label="Toggle billing period"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                billing === "yearly" ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors ${
              billing === "yearly" ? "text-gray-900" : "text-gray-400"
            }`}
          >
            Yearly
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              Save 20%
            </span>
          </span>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? "border-[#A23469] shadow-2xl shadow-[#A23469]/10 scale-105 bg-white"
                  : "border-gray-200 bg-white hover:border-[#A23469]/30 hover:shadow-xl"
              }`}
            >
              {/* Most popular badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#A23469] text-white text-xs font-bold shadow-lg tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                    {getPrice(plan)}
                  </span>
                  {typeof (billing === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice) === "number" && (
                    <span className="text-gray-500 text-base mb-1.5">/mo</span>
                  )}
                </div>
                {billing === "yearly" &&
                  typeof plan.yearlyPrice === "number" && (
                    <p className="text-xs text-gray-400 mt-1">
                      Billed annually (${plan.yearlyPrice * 12}/year)
                    </p>
                  )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        plan.highlighted
                          ? "bg-[#A23469] text-white"
                          : "bg-[#FDF2F7] text-[#A23469]"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-sm text-gray-600">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-[#A23469] text-white hover:bg-[#802A54] shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    : "border-2 border-[#A23469] text-[#A23469] hover:bg-[#FDF2F7]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
