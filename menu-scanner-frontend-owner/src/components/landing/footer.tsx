"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function Footer() {
  const { footer } = LANDING_CONFIG;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn direction="up">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div>
              <Link href={ROUTES.PUBLIC.HOME} className="inline-block mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{footer.company}</h3>
              </Link>
              <p className="text-base text-slate-600 leading-relaxed mb-4">
                {footer.description}
              </p>
              <div className="text-sm text-slate-600 space-y-2">
                <p className="font-semibold text-slate-900">Contact</p>
                <p>{footer.contact.email}</p>
                <p>{footer.contact.phone}</p>
                <p>{footer.contact.location}</p>
              </div>
            </div>

            {/* Link columns from config */}
            {Object.entries(footer.links).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-base font-bold text-slate-900 mb-4">{category}</h4>
                <ul className="space-y-3">
                  {(links as string[]).map((label) => (
                    <li key={label}>
                      <a href="#" className="text-base text-slate-600 hover:text-primary transition-colors">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-base text-slate-600 mb-4">
              <span>© {new Date().getFullYear()} {footer.company}. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <div className="flex gap-6">
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                </div>
                <button
                  onClick={scrollToTop}
                  className="w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all group"
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-6">
              {footer.social}
            </p>
            <div className="flex gap-6 justify-center text-sm text-slate-600">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
