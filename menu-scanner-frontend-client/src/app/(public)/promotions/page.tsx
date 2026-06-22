"use client";

import { Flame, Zap } from "lucide-react";
import { ProductListPage } from "@/features/main/components/product/product-list-page";

function PromotionsHero() {
  return (
    <div
      className="rounded p-4 sm:p-5 text-white shadow-xl overflow-hidden relative bg-primary"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-3xl -mr-14 -mt-14" />
      <div className="absolute bottom-0 left-1/2 w-44 h-44 bg-white/5 rounded-full blur-3xl -ml-24 -mb-24" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-white/20 backdrop-blur-sm">
            <Flame className="h-4 w-4 animate-bounce" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight">Hot Deals & Promotions</h1>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="h-2.5 w-2.5 text-yellow-300" />
              <span className="text-xs font-semibold text-white/90">Limited Time Offers</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/90 max-w-xl leading-relaxed">
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
