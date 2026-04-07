"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "../shared/common/page-container";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: Facebook,
    color: "hover:text-blue-600",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
    color: "hover:text-pink-600",
  },
  {
    name: "Email",
    href: "mailto:support@menuscanner.com",
    icon: Mail,
    color: "hover:text-green-600",
  },
];

export function Footer() {

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <PageContainer>
        {/* Logo, Description & Social Links */}
        <div className="py-12 space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
              <Image
                src="/assets/favicon.ico"
                alt="Logo"
                width={24}
                height={24}
                className="rounded object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-bold text-sm leading-tight">
                Menu Scanner
              </span>
              <span className="text-muted-foreground text-xs">
                E-Commerce
              </span>
            </div>
          </Link>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            Your trusted online shopping destination. Discover quality
            products at the best prices with fast delivery and excellent
            customer service.
          </p>

          {/* Social Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Follow Us</h4>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className={`${social.color} transition-colors`}
                  >
                    <social.icon className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Address</h4>
                <p className="text-sm text-muted-foreground">
                  123 Street Name, Phnom Penh,
                  <br />
                  Cambodia
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Phone</h4>
                <p className="text-sm text-muted-foreground">
                  +855 12 345 678
                  <br />
                  +855 98 765 432
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Email</h4>
                <p className="text-sm text-muted-foreground">
                  support@menuscanner.com
                  <br />
                  info@menuscanner.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
