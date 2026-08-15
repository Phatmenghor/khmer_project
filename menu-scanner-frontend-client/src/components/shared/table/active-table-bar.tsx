"use client";

import React, { useState, useEffect } from "react";
import { getActiveTableSession, clearActiveTableSession, ActiveTableSession } from "@/utils/table/table-session";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { Utensils, X, Receipt, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function ActiveTableBar() {
  const router = useRouter();
  const [activeTable, setActiveTable] = useState<ActiveTableSession | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setActiveTable(getActiveTableSession());

    const handleStorage = () => {
      setActiveTable(getActiveTableSession());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!activeTable) return null;

  const handleClearSession = () => {
    clearActiveTableSession();
    setActiveTable(null);
    showToast.info("Cleared active table session.");
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-card/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs animate-pulse">
          <Utensils className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-foreground truncate">
              {activeTable.tableName}
            </span>
            <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/30 uppercase">
              Live Table
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium truncate">
            Dine-in menu active • Orders served directly
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/orders")}
          className="h-8 text-[11px] font-bold rounded-xl gap-1 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5"
        >
          <Receipt className="w-3 h-3" />
          <span>My Orders</span>
        </CustomButton>

        <button
          type="button"
          onClick={handleClearSession}
          className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          title="Exit Table Session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
