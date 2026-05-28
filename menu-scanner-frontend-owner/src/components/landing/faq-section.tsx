"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does the 14-day free trial work?",
    answer:
      "Sign up and get full access to all Professional features for 14 days — no credit card required. After the trial, choose the plan that fits your needs or continue with our free Starter plan.",
  },
  {
    question: "Can I use eMenu across multiple restaurant locations?",
    answer:
      "Yes! Our Professional and Enterprise plans support multiple locations. Each location gets its own menu, QR codes, and analytics dashboard, all managed from one account.",
  },
  {
    question: "Do my customers need to download an app?",
    answer:
      "No app required! Guests simply scan the QR code with their phone's camera and the menu opens instantly in their browser. Completely frictionless experience.",
  },
  {
    question: "How long does the initial setup take?",
    answer:
      "Most restaurants are fully set up within a few hours. Our onboarding guide walks you through every step, and our support team is available to help whenever you need.",
  },
  {
    question: "Can I customize the look of my digital menu?",
    answer:
      "Absolutely. You can add your logo, choose color themes, organize categories, add product photos, and write descriptions. Your digital menu will feel uniquely yours.",
  },
  {
    question: "What payment methods does eMenu support?",
    answer:
      "eMenu supports cash, ABA Pay, Wing, credit/debit cards, and most major digital wallets used in Cambodia. Payment records are logged automatically.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="contact" className="bg-white py-20 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FDF2F7] text-[#A23469] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#A23469]/20">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500">
            Everything you need to know about eMenu. Can&apos;t find your
            answer?{" "}
            <a
              href="mailto:support@emenu.app"
              className="text-[#A23469] font-medium hover:underline"
            >
              Contact our team
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#A23469]/40 shadow-md shadow-[#A23469]/5"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200 ${
                    isOpen ? "bg-[#FDF2F7]" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-base font-semibold pr-4 ${
                      isOpen ? "text-[#A23469]" : "text-gray-900"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 text-[#A23469]"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                {/* Answer — animated expand */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-5 pt-2 bg-white">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Our team is ready to help you get started and answer anything you
            need.
          </p>
          <a
            href="mailto:support@emenu.app"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-[#A23469] text-white text-sm font-semibold hover:bg-[#802A54] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
