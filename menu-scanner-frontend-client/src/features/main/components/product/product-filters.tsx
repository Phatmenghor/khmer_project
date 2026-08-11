"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/utils/debounce/debounce";
import { usePublicCategoriesState } from "@/features/main/store/state/public-categories-state";
import { usePublicBrandsState } from "@/features/main/store/state/public-brands-state";
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
      {/* Group 1: Promotions */}
      {!lockedPromotion && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Promotions
          </label>
          <div
            className={cn(
              "flex items-center justify-between rounded-[12px] p-2.5 sm:p-3 border transition-all cursor-pointer shadow-2xs",
              hasPromotion
                ? "border-amber-500/60 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40",
            )}
            onClick={() =>
              updateFilter("hasPromotion", hasPromotion ? "" : "true")
            }
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-[10px] shrink-0 transition-colors",
                  hasPromotion ? "bg-amber-500/20" : "bg-amber-500/10",
                )}
              >
                <Flame
                  className={cn(
                    "h-3.5 w-3.5",
                    hasPromotion ? "text-amber-600" : "text-amber-500",
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight truncate">
                  On Sale Only
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Promotional items
                </p>
              </div>
            </div>
            <Switch
              checked={hasPromotion}
              onCheckedChange={(checked) =>
                updateFilter("hasPromotion", checked ? "true" : "")
              }
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-amber-500 shrink-0"
            />
          </div>
        </div>
      )}

      {/* Group 2: Categories & Brands */}
      <div className="space-y-3 pt-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
          Categories & Brands
        </label>
        <ComboboxSelectCategoriesPublic
          selectedCategory={selectedCategory}
          onChangeSelected={(categoryId) =>
            updateFilter("categoryId", categoryId)
          }
          label="Category"
          size="md"
          placeholder="All Categories"
        />

        <ComboboxSelectBrandPublic
          selectedBrand={selectedBrand}
          onChangeSelected={(brandId) => updateFilter("brandId", brandId)}
          label="Brand"
          size="md"
          placeholder="All Brands"
        />
      </div>

      {/* Group 3: Price Range (Real-time Debounced) */}
      <div className="space-y-2 pt-1 border-t border-border/40">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Price Range
          </label>
          {hasPriceFilter && (
            <CustomButton
              size="sm"
              variant="ghost"
              className="h-5 px-1 text-[11px] text-muted-foreground hover:text-destructive gap-1"
              onClick={clearPrice}
              title="Clear price filter"
            >
              <X className="h-3 w-3" />
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
              className="h-8 sm:h-8.5 pl-6 text-xs rounded-[10px] bg-muted/30 border-border/60 focus:bg-background transition-colors"
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
              className="h-8 sm:h-8.5 pl-6 text-xs rounded-[10px] bg-muted/30 border-border/60 focus:bg-background transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {}
      <div className="hidden lg:flex w-52 flex-shrink-0">
        <div className="sticky top-16 h-[calc(100vh-7rem)] w-full">
          <div className="bg-card border border-border/60 rounded-[16px] shadow-2xs h-full flex flex-col overflow-hidden">
            {}
            <div className="flex items-center justify-between px-3 py-3 border-b border-border/60 flex-shrink-0">
              <div className="flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3 text-primary" />
                <h3 className="font-bold text-xs">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge className="rounded-full h-3 w-3 p-0 flex items-center justify-center text-[10px] font-bold">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <CustomButton
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 text-xs"
                  onClick={clearAllFilters}
                >
                  <FilterX className="h-2.5 w-2.5" />
                  Clear all
                </CustomButton>
              )}
            </div>

            {}
            <div className="px-3 py-2 border-b border-border/40 flex-shrink-0 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {totalResults.toLocaleString()}
                </span>{" "}
                result{totalResults !== 1 ? "s" : ""} found
              </p>
            </div>

            {}
            <ScrollArea className="flex-1">
              <div className="p-3">
                {filterContent}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between gap-2 bg-card border border-border/60 rounded-[16px] p-3 shadow-2xs">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">
              {totalResults.toLocaleString()} result
              {totalResults !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied`
                : "No filters applied"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {activeFiltersCount > 0 && (
              <CustomButton
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-[10px] text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-1 text-xs active:scale-[0.97]"
                onClick={clearAllFilters}
              >
                <FilterX className="h-3 w-3" />
                Clear
              </CustomButton>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <CustomButton variant="default" size="sm" className="h-8 gap-1.5 px-3 rounded-[10px] text-xs font-semibold active:scale-[0.97]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 rounded-full h-3 w-3 p-0 flex items-center justify-center text-[10px] font-bold bg-white text-primary"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </CustomButton>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-56 sm:w-64 p-0 flex flex-col"
              >
                <SheetHeader className="px-3 py-3 border-b border-border/60 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-1">
                      <SlidersHorizontal className="h-3 w-3 text-primary" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="rounded-full h-3 w-3 p-0 flex items-center justify-center text-[10px] font-bold">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </SheetTitle>
                    {activeFiltersCount > 0 && (
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 text-xs"
                        onClick={clearAllFilters}
                      >
                        <FilterX className="h-2.5 w-2.5" />
                        Clear all
                      </CustomButton>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-left mt-1">
                    <span className="font-semibold text-foreground">
                      {totalResults.toLocaleString()}
                    </span>{" "}
                    result{totalResults !== 1 ? "s" : ""} found
                  </p>
                </SheetHeader>
                <ScrollArea className="flex-1">
                  <div className="p-3">
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
