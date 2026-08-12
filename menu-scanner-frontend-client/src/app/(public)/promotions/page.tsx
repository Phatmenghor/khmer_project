"use client";

import { Flame } from "lucide-react";
import { ProductListPage } from "@/features/main/components/product/product-list-page";

function PromotionsHero() {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-red-500/25 bg-gradient-to-r from-red-500/12 via-orange-500/10 to-amber-500/8 dark:from-red-950/40 dark:via-orange-950/30 dark:to-amber-950/20 p-4 sm:p-5 shadow-xs">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/25 via-orange-500/20 to-amber-500/15 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-500 shrink-0 border border-red-500/20 shadow-2xs">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" aria-label="Hot deals icon" />
            </span>
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-foreground">
              Hot Deals & Promotions
            </h1>
            <span className="text-[10px] sm:text-[11px] font-extrabold bg-gradient-to-r from-red-600 to-rose-500 text-white px-3 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
              🔥 Limited Offer
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium pl-0.5">
            Grab hot discounts while stocks last — Exclusive time-limited prices! 🎁
          </p>
        </div>
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
