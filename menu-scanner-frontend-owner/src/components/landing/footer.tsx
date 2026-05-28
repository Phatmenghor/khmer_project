import Link from "next/link";
import { QrCode } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/app-routes/routes";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <QrCode className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">eMenu</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Smarter menus for smarter restaurants. Grow your business with eMenu.
            </p>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              {/* Telegram */}
              <a href="#" className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Telegram">
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.509 1.793.997 3.592 1.48 5.388.16.36.506.494.864.498.35.004.578-.16.717-.291.855-.793 2.148-2.03 3.432-3.26.618.44 1.58 1.147 2.434 1.773l1.534 1.163c.426.317.82.68 1.42.663.43.002.877-.235 1.128-.628.29-.46.36-1.06.503-1.635.562-2.578 1.119-5.158 1.668-7.738.205-1.167.436-2.42.456-3.5a2.064 2.064 0 0 0-.585-1.577 2.022 2.022 0 0 0-1.57-.464z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{heading}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} eMenu. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
