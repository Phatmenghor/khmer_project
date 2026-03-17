"use client";

import { Flame } from "lucide-react";
import { ProductListPage } from "@/redux/features/main/components/product/product-list-page";

function PromotionsHero() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-5 sm:p-7 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
          <Flame className="h-5 w-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Hot Deals &amp; Promotions</h1>
      </div>
      <p className="text-sm text-white/80 pl-13">
        Exclusive discounts and limited-time offers — grab them before they&apos;re gone!
      </p>
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
