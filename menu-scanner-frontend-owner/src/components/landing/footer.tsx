import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG } from "@/constants/landing-config";
import { appImages } from "@/constants/app-resource/icons/app-images";

const FOOTER_LINK_MAP: Record<string, string> = {
  Pricing: "#pricing",
  Capabilities: "#capabilities",
  Features: "#capabilities",
  "How It Works": "#how-it-works",
  About: "#founder",
  Founder: "#founder",
  FAQ: "#faq",
  Contact: "https://t.me/Hor_HOrz",
  Documentation: "#capabilities",
  Status: "#pricing",
};

export default function Footer() {
  const { footer } = LANDING_CONFIG;

  return (
    <footer className="border-t border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn direction="up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Column */}
            <div className="space-y-3 lg:col-span-2">
              <Link href={ROUTES.PUBLIC.HOME} className="inline-block group">
                <Image
                  src={appImages.scanmekhLogo}
                  alt="ScanMeKH Logo"
                  width={160}
                  height={90}
                  className="h-10 sm:h-12 w-auto transition-transform duration-200 group-hover:scale-105"
                  priority
                />
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm font-medium">
                {footer.description}
              </p>
              <div className="text-xs text-muted-foreground space-y-1 pt-1 font-medium">
                <p className="font-bold text-foreground">Contact & Support</p>
                <p>Email: {footer.contact.email}</p>
                <p>Location: {footer.contact.location}</p>
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footer.links).map(([category, links]) => (
              <div key={category} className="space-y-2.5">
                <h4 className="text-xs font-bold text-foreground tracking-tight">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {(links as string[]).map((label) => {
                    const targetHref = FOOTER_LINK_MAP[label] || "#pricing";
                    return (
                      <li key={label}>
                        <a
                          href={targetHref}
                          className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                        >
                          {label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <span>
              © {new Date().getFullYear()} {footer.company}. All rights reserved.
            </span>
            <span className="font-semibold text-primary">
              {footer.social}
            </span>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
