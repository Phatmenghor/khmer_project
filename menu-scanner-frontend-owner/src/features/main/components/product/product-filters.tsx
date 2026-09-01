"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  X,
  SlidersHorizontal,
  Flame,
  FilterX,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/utils/debounce/debounce";
import { ComboboxSelectBrandPublic } from "@/components/shared/combobox/combobox_select_brand_public";
import { ComboboxSelectCategoriesPublic } from "@/components/shared/combobox/combobox_select_categories_public";

interface ProductFiltersProps {
  totalResults: number;
  basePath?: string;
  lockedPromotion?: boolean;
}

function ProductFiltersComponent({
  totalResults,
  basePath = "/products",
  lockedPromotion = false,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);

  useEffect(() => {
    setSelectedCategory(searchParams.get("categoryId") || "");
    setSelectedBrand(searchParams.get("brandId") || "");
    setHasPromotion(!!searchParams.get("hasPromotion"));
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, basePath],
  );

  // Sync debounced price values to URL query params automatically
  useEffect(() => {
    const urlMin = searchParams.get("minPrice") || "";
    const urlMax = searchParams.get("maxPrice") || "";

    if (debouncedMinPrice === urlMin && debouncedMaxPrice === urlMax) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedMinPrice) params.set("minPrice", debouncedMinPrice);
    else params.delete("minPrice");

    if (debouncedMaxPrice) params.set("maxPrice", debouncedMaxPrice);
    else params.delete("maxPrice");

    pushParams(params);
  }, [debouncedMinPrice, debouncedMaxPrice, searchParams, pushParams]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      pushParams(params);
    },
    [searchParams, pushParams],
  );

  const clearPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    setMinPrice("");
    setMaxPrice("");
    pushParams(params);
  }, [searchParams, pushParams]);

  const clearAllFilters = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    router.push(basePath);
  }, [router, basePath]);

  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  const hasPriceFilter = !!(urlMinPrice || urlMaxPrice);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (!lockedPromotion && hasPromotion ? 1 : 0) +
    (hasPriceFilter ? 1 : 0);

  const filterContent = (
    <div className="space-y-4">
      {/* Group 1: On Sale Only Switch */}
      {!lockedPromotion && (
        <div className="space-y-1">
          <div
            className={cn(
              "flex items-center justify-between rounded-xl p-3 border transition-all cursor-pointer",
              hasPromotion
                ? "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40",
            )}
            onClick={() =>
              updateFilter("hasPromotion", hasPromotion ? "" : "true")
            }
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors",
                  hasPromotion ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground",
                )}
              >
                <Flame className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight truncate">
                  On Sale Only
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Show discounted items
                </p>
              </div>
            </div>
            <Switch
              checked={hasPromotion}
              onCheckedChange={(checked) =>
                updateFilter("hasPromotion", checked ? "true" : "")
              }
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-amber-500 shrink-0 scale-90"
            />
          </div>
        </div>
      )}

      {/* Group 2: Categories & Brands */}
      <div className="space-y-3 pt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Filter Options
        </span>
        
        <div className="space-y-2.5">
          <ComboboxSelectCategoriesPublic
            selectedCategory={selectedCategory}
            onChangeSelected={(categoryId) =>
              updateFilter("categoryId", categoryId)
            }
            label="Category"
            size="sm"
            placeholder="All Categories"
          />

          <ComboboxSelectBrandPublic
            selectedBrand={selectedBrand}
            onChangeSelected={(brandId) => updateFilter("brandId", brandId)}
            label="Brand"
            size="sm"
            placeholder="All Brands"
          />
        </div>
      </div>

      {/* Group 3: Price Range */}
      <div className="space-y-2.5 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Price Range ($)
          </span>
          {hasPriceFilter && (
            <CustomButton
              size="sm"
              variant="ghost"
              className="h-5 px-1 text-[10px] text-muted-foreground hover:text-destructive gap-1"
              onClick={clearPrice}
              title="Clear price filter"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </CustomButton>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs text-muted-foreground font-medium pointer-events-none">$</span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                  setMinPrice(val);
                }
              }}
              className="h-8 pl-6 text-xs rounded-[10px] bg-muted/20 border-border/60 focus:bg-background transition-colors"
            />
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs text-muted-foreground font-medium pointer-events-none">$</span>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                  setMaxPrice(val);
                }
              }}
              className="h-8 pl-6 text-xs rounded-[10px] bg-muted/20 border-border/60 focus:bg-background transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter Card */}
      <div className="hidden lg:flex w-60 flex-shrink-0">
        <div className="sticky top-16 h-[calc(100vh-7rem)] w-full">
          <div className="bg-card border border-border/70 rounded-[18px] shadow-2xs h-full flex flex-col overflow-hidden">
            {/* Filter Header */}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/50 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <h3 className="font-extrabold text-xs text-foreground">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge className="rounded-full h-4 min-w-4 px-1 p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <CustomButton
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 text-[11px] font-semibold"
                  onClick={clearAllFilters}
                >
                  <FilterX className="h-2.5 w-2.5" />
                  Clear
                </CustomButton>
              )}
            </div>

            {/* Results count pill */}
            <div className="px-3.5 py-2 border-b border-border/40 flex-shrink-0 bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">
                <span className="font-bold text-foreground">
                  {totalResults.toLocaleString()}
                </span>{" "}
                item{totalResults !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Filter Content */}
            <ScrollArea className="flex-1">
              <div className="p-3.5">
                {filterContent}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Filter Trigger */}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between gap-2 bg-card border border-border/70 rounded-[14px] p-2.5 sm:p-3 shadow-2xs">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              {totalResults.toLocaleString()} item{totalResults !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? "s" : ""}`
                : "All items shown"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {activeFiltersCount > 0 && (
              <CustomButton
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-1 text-xs active:scale-[0.97]"
                onClick={clearAllFilters}
              >
                <FilterX className="h-3 w-3" />
                Clear
              </CustomButton>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <CustomButton variant="default" size="sm" className="h-8 gap-1.5 px-3 rounded-xl text-xs font-bold active:scale-[0.97]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 rounded-full h-4 min-w-4 p-0 flex items-center justify-center text-[10px] font-bold bg-white text-primary"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </CustomButton>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 flex flex-col">
                <SheetHeader className="px-4 py-3 border-b border-border/60 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-1.5 text-sm font-extrabold">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="rounded-full h-4 min-w-4 px-1 p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </SheetTitle>
                    {activeFiltersCount > 0 && (
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 text-xs font-semibold"
                        onClick={clearAllFilters}
                      >
                        <FilterX className="h-3 w-3" />
                        Clear all
                      </CustomButton>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-left mt-0.5 font-medium">
                    <span className="font-bold text-foreground">
                      {totalResults.toLocaleString()}
                    </span>{" "}
                    items found
                  </p>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {filterContent}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}

export const ProductFilters = memo(ProductFiltersComponent, (prevProps, nextProps) => {
  return (
    prevProps.basePath === nextProps.basePath &&
    prevProps.lockedPromotion === nextProps.lockedPromotion
  );
});
