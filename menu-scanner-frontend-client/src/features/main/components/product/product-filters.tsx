"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
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
  ListChecks,
  FilterX,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicCategoriesState } from "@/features/main/store/state/public-categories-state";
import { usePublicBrandsState } from "@/features/main/store/state/public-brands-state";
import { ComboboxSelectBrandPublic } from "@/components/shared/combobox/combobox_select_brand_public";
import { ComboboxSelectCategoriesPublic } from "@/components/shared/combobox/combobox_select_categories_public";

const PRODUCT_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
];

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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");


  useEffect(() => {
    setSelectedCategory(searchParams.get("categoryId") || "");
    setSelectedBrand(searchParams.get("brandId") || "");
    setSelectedStatuses(
      searchParams.get("status")?.split(",").filter(Boolean) || [],
    );
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

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      pushParams(params);
    },
    [searchParams, pushParams],
  );

  const toggleStatus = useCallback(
    (status: string) => {
      const current =
        searchParams.get("status")?.split(",").filter(Boolean) || [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      const params = new URLSearchParams(searchParams.toString());
      if (next.length > 0) params.set("status", next.join(","));
      else params.delete("status");
      pushParams(params);
    },
    [searchParams, pushParams],
  );

  const applyPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    pushParams(params);
  }, [searchParams, pushParams, minPrice, maxPrice]);

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
    selectedStatuses.length +
    (!lockedPromotion && hasPromotion ? 1 : 0) +
    (hasPriceFilter ? 1 : 0);


  const filterContent = (
    <div className="space-y-3.5">
      {}
      {!lockedPromotion && (
        <>
          <div
            className={cn(
              "flex items-center justify-between rounded px-2 py-2 border transition-colors cursor-pointer",
              hasPromotion
                ? "border-orange-400/60 bg-orange-500/5"
                : "border-border/60 hover:border-border",
            )}
            onClick={() =>
              updateFilter("hasPromotion", hasPromotion ? "" : "true")
            }
          >
            <div className="flex items-center gap-1.5.5">
              <div
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded transition-colors",
                  hasPromotion ? "bg-orange-500/20" : "bg-orange-500/10",
                )}
              >
                <Flame
                  className={cn(
                    "h-2.5 w-2.5",
                    hasPromotion ? "text-orange-500" : "text-orange-400",
                  )}
                />
              </div>
              <div>
                <p className="text-xs font-semibold leading-none">
                  On Sale Only
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Show promotional items
                </p>
              </div>
            </div>
            <Switch
              checked={hasPromotion}
              onCheckedChange={(checked) =>
                updateFilter("hasPromotion", checked ? "true" : "")
              }
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
          <Separator />
        </>
      )}

      {}
      <ComboboxSelectCategoriesPublic
        selectedCategory={selectedCategory}
        onChangeSelected={(categoryId) =>
          updateFilter("categoryId", categoryId)
        }
        label="Category"
        size="md"
        placeholder="All Categories"
      />

      <Separator />

      {}
      <ComboboxSelectBrandPublic
        selectedBrand={selectedBrand}
        onChangeSelected={(brandId) => updateFilter("brandId", brandId)}
        label="Brand"
        size="md"
        placeholder="All Brands"
      />

      <Separator />

      {}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-green-500/10">
            <ListChecks className="h-2.5 w-2.5 text-green-600" />
          </div>
          <label className="text-xs font-semibold">Status</label>
          {selectedStatuses.length > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full h-3.5 w-3.5 p-0 flex items-center justify-center text-[10px] font-bold ml-auto"
            >
              {selectedStatuses.length}
            </Badge>
          )}
        </div>
        <div className="space-y-1.5.5">
          {PRODUCT_STATUSES.map((status) => (
            <label
              key={status.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                id={`status-${status.value}`}
                checked={selectedStatuses.includes(status.value)}
                onCheckedChange={() => toggleStatus(status.value)}
              />
              <span className="text-xs group-hover:text-primary transition-colors select-none">
                {status.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-yellow-500/10">
            <DollarSign className="h-2.5 w-2.5 text-yellow-600" />
          </div>
          <label className="text-xs font-semibold">Price Range</label>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-6 text-xs"
          />
          <span className="text-muted-foreground text-xs flex-shrink-0">–</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-6 text-xs"
          />
        </div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            className="flex-1"
            onClick={applyPrice}
            disabled={!minPrice && !maxPrice}
          >
            Apply
          </Button>
          {hasPriceFilter && (
            <Button size="sm" variant="outline" onClick={clearPrice}>
              <X className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {}
      <div className="hidden lg:flex w-52 flex-shrink-0">
        <div className="sticky top-16 h-[calc(100vh-7rem)] w-full">
          <div className="bg-card border rounded shadow-sm h-full flex flex-col">
            {}
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/60 flex-shrink-0">
              <div className="flex items-center gap-1.5.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <h3 className="font-bold text-xs">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge className="rounded-full h-3.5 w-3.5 p-0 flex items-center justify-center text-[10px] font-bold">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                  onClick={clearAllFilters}
                >
                  <FilterX className="h-2.5 w-2.5" />
                  Clear all
                </Button>
              )}
            </div>

            {}
            <div className="px-3.5 py-2 border-b border-border/40 flex-shrink-0 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {totalResults.toLocaleString()}
                </span>{" "}
                result{totalResults !== 1 ? "s" : ""} found
              </p>
            </div>

            {}
            <ScrollArea className="flex-1">
              <div className="p-3.5">
                {filterContent}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between gap-2 bg-card border rounded p-3 shadow-sm">
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
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-1.5 text-xs"
                onClick={clearAllFilters}
              >
                <FilterX className="h-2.5 w-2.5" />
                Clear
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="sm" className="h-6 gap-1.5">
                  <SlidersHorizontal className="h-3 w-3" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 rounded-full h-3.5 w-3.5 p-0 flex items-center justify-center text-[10px] font-bold bg-white text-primary"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-56 sm:w-64 p-0 flex flex-col"
              >
                <SheetHeader className="px-3.5 py-3 border-b border-border/60 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-1.5.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge className="rounded-full h-3.5 w-3.5 p-0 flex items-center justify-center text-[10px] font-bold">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </SheetTitle>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                        onClick={clearAllFilters}
                      >
                        <FilterX className="h-2.5 w-2.5" />
                        Clear all
                      </Button>
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
                  <div className="p-3.5">
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
