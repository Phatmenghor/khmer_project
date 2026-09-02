"use client";

import React from "react";
import { 
  QrCode, 
  ShoppingCart, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Package,
  Users,
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import FadeIn from "@/components/landing/fade-in";
import Link from "next/link";
import { ROUTES } from "@/constants/app-routes/routes";

import { showToast } from "@/components/shared/common/show-toast";

const PLATFORM_CAPABILITIES = [
  {
    id: "cap-1",
    step: "01",
    icon: QrCode,
    title: "QR Menu & Storefront",
    description: "Contactless ordering for customers from any mobile browser.",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    features: [
      "Instant QR code & link export",
      "Categorized menus with item variants",
      "No mobile app download needed",
      "Live stock & availability toggle",
    ],
  },
  {
    id: "cap-2",
    step: "02",
    icon: ShoppingCart,
    title: "Shop POS & Online Orders",
    description: "In-store POS & online orders routed to kitchen in real time.",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    features: [
      "Shop POS & table order checkout",
      "Status: Pending → Preparing → Done",
      "Telegram bot instant order alerts",
      "Instant real-time sync across devices",
    ],
  },
  {
    id: "cap-3",
    step: "03",
    icon: Package,
    title: "Stock & Inventory",
    description: "Manage products, categories, brands, and low-stock alerts.",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    features: [
      "Product categories & brand tracking",
      "Real-time stock level monitoring",
      "Out-of-stock & low-stock alerts",
      "Variant price & option management",
    ],
  },
  {
    id: "cap-4",
    step: "04",
    icon: Users,
    title: "Staff, HR & Attendance",
    description: "Multi-role team management, attendance logs & security.",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    features: [
      "Roles: Owner, Admin, Manager, Staff",
      "Staff attendance & activity logs",
      "Action audit trail for security",
      "Unlimited staff accounts included",
    ],
  },
  {
    id: "cap-5",
    step: "05",
    icon: Tag,
    title: "Promotions & Discounts",
    description: "Run product sales, bulk promotions, and deal banners.",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    features: [
      "Item sale tags & discount rates",
      "Storefront deal banner displays",
      "Bulk promotion scheduling",
      "Special customer deal offers",
    ],
  },
  {
    id: "cap-6",
    step: "06",
    icon: BarChart3,
    title: "Analytics, Reports & History",
    description: "Exportable revenue reports, financial statements & store history.",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    features: [
      "Exportable sales reports & statements",
      "Daily & monthly revenue trends",
      "Top-selling product statistics",
      "Store history & multi-branch control",
    ],
  },
];

export default function PlatformCapabilitiesSection() {
  const handleExploreModule = () => {
    showToast.info(
      "This module preview is currently under scheduled maintenance. Please sign in or register your business to access live features!"
    );
  };

  return (
    <section id="capabilities" className="py-12 sm:py-16 bg-muted/20 relative overflow-hidden">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1 mb-8">
          <Badge variant="secondary" className="px-3 py-0.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
            <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Complete Portfolio Ecosystem
          </Badge>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium pt-1">
            End-to-end QR menu, Shop POS, Staff HR, Inventory, Financial Reports, and Analytics platform.
          </p>
        </div>

        {/* 6 Portfolio Capability Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PLATFORM_CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;

            return (
              <FadeIn key={cap.id} delay={idx * 60}>
                <Card className="p-4 sm:p-5 rounded-[16px] border border-border/80 bg-card shadow-2xs hover:shadow-xs transition-all duration-200 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-primary/70 tracking-wider">
                        MODULE {cap.step}
                      </span>
                      <div className={`p-2 rounded-[10px] border ${cap.badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                        {cap.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {cap.description}
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-1">
                      {cap.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/90 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border/40 mt-3">
                    <CustomButton
                      variant="outline"
                      onClick={handleExploreModule}
                      className="w-full h-[34px] text-xs font-semibold rounded-[12px] gap-1 cursor-pointer hover:border-primary/50"
                    >
                      Explore Module
                      <ArrowRight className="w-3 h-3" />
                    </CustomButton>
                  </div>
                </Card>
              </FadeIn>
            );
          })}
        </div>

        {/* Clean CTA Strip */}
        <div className="mt-10 p-5 rounded-[16px] border border-border/80 bg-card shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Ready to start using ScanMeKH for your business?
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Create your business profile, menu, and staff team in minutes.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={ROUTES.AUTH.LOGIN}>
              <CustomButton variant="outline" className="h-[36px] px-4 text-xs font-semibold rounded-[12px]">
                Sign In
              </CustomButton>
            </Link>
            <Link href={ROUTES.AUTH.LOGIN}>
              <CustomButton variant="default" className="h-[36px] px-4 text-xs font-semibold rounded-[12px] gap-1.5 shadow-2xs">
                Register Free
                <ArrowRight className="w-3.5 h-3.5" />
              </CustomButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
