"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageContainer } from "../shared/common/page-container";
import { useState } from "react";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
  ],
  shop: [
    { name: "All Products", href: "/products" },
    { name: "Promotions", href: "/promotions" },
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Best Sellers", href: "/best-sellers" },
  ],
  support: [
    { name: "FAQs", href: "/faqs" },
    { name: "Shipping & Returns", href: "/shipping" },
    { name: "Payment Methods", href: "/payment-methods" },
    { name: "Track Order", href: "/track-order" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Refund Policy", href: "/refund-policy" },
  ],
};

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

const paymentMethods = [
  // { name: "Visa", src: "/assets/image/visa.png" },
  // { name: "Mastercard", src: "/assets/image/mastercard.png" },
  // { name: "PayPal", src: "/assets/image/paypal.png" },
  { name: "ABA", src: "/assets/image/cpbank.png" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    // Handle newsletter subscription
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setEmail("");
    setIsSubscribing(false);
    // Show success message
  };

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <PageContainer>
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-12">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted online shopping destination. Discover quality
              products at the best prices with fast delivery and excellent
              customer service.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                Subscribe to our Newsletter
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-background"
                  required
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSubscribing}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Get the latest updates and offers.
              </p>
            </div>

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

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
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

        {/* Bottom Footer */}
        <div className="border-t py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-foreground">
                  Menu Scanner E-Commerce
                </span>
                . All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground text-center md:text-left">
                Owned and operated by{" "}
                <span className="font-medium text-foreground">
                  Menu Scanner Group
                </span>
                . Registered in Cambodia.
              </p>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-2">
                We Accept:
              </span>
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="h-8 w-12 bg-background rounded border flex items-center justify-center p-1"
                  title={method.name}
                >
                  <Image
                    src={method.src}
                    alt={method.name}
                    width={40}
                    height={25}
                    className="object-contain"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Owner Info */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground text-center md:text-left">
              <div>
                <span className="font-semibold text-foreground">
                  Business License:
                </span>{" "}
                #MS-2024-KH-001
              </div>
              <div>
                <span className="font-semibold text-foreground">Tax ID:</span>{" "}
                K001-234567890
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  Customer Service:
                </span>{" "}
                Available 24/7
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Secure Shopping</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Verified Seller</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
