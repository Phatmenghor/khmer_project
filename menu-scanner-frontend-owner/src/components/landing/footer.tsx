import Link from "next/link";
import { QrCode } from "lucide-react";
import { ROUTES } from "@/constants/app-routes/routes";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">EMenu Cambodia</span>
            </Link>
            <p className="text-base text-slate-400 leading-relaxed mb-5">
              Smart digital menus for businesses across Cambodia. Go paperless. Grow faster.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center hover:border-slate-500 hover:bg-slate-800 transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center hover:border-slate-500 hover:bg-slate-800 transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center hover:border-slate-500 hover:bg-slate-800 transition-colors" aria-label="Telegram">
                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.509 1.793.997 3.592 1.48 5.388.16.36.506.494.864.498.35.004.578-.16.717-.291.855-.793 2.148-2.03 3.432-3.26.618.44 1.58 1.147 2.434 1.773l1.534 1.163c.426.317.82.68 1.42.663.43.002.877-.235 1.128-.628.29-.46.36-1.06.503-1.635.562-2.578 1.119-5.158 1.668-7.738.205-1.167.436-2.42.456-3.5a2.064 2.064 0 0 0-.585-1.577 2.022 2.022 0 0 0-1.57-.464z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-base font-semibold text-white mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-base text-slate-400 hover:text-white transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-base text-slate-500">
          <span>© {new Date().getFullYear()} EMenu Cambodia. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
