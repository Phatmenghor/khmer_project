"use client";

import { Flame, Zap } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { ProductListPage } from "@/features/main/components/product/product-list-page";

function PromotionsHero() {
  const businessSettings = useAppSelector(selectBusinessSettings);
  const primaryColor = businessSettings?.primaryColor || "#57823D";

  return (
    <div 
      className="rounded-2xl p-6 sm:p-8 text-white shadow-xl overflow-hidden relative"
      style={{
        backgroundColor: primaryColor,
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
            <Flame className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hot Deals & Promotions</h1>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="h-3.5 w-3.5 text-yellow-300" />
              <span className="text-xs font-semibold text-white/90">Limited Time Offers</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/90 max-w-xl leading-relaxed">
          Discover exclusive discounts and limited-time offers. Grab your favorites before they&apos;re gone!
        </p>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  return (
    <ProductListPage
      basePath="/promotions"
      lockedPromotion={true}
      scrollKey="promotions"
      hero={<PromotionsHero />}
    />
  );
}
