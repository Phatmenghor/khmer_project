"use client";

import React from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import { setSelectedCategory } from "@/features/business/store/slice/pos-page-slice";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";

interface POSCategorySelectorProps {
  categories: CategoriesResponseModel[];
  categoriesLoading: boolean;
  selectedCategory: CategoriesResponseModel | null;
  categoryScrollRef: React.RefObject<HTMLDivElement>;
  scrollCategories: (direction: "left" | "right") => void;
}

export function POSCategorySelector({
  categories,
  categoriesLoading,
  selectedCategory,
  categoryScrollRef,
  scrollCategories,
}: POSCategorySelectorProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="shrink-0 border-b border-border/70 bg-card/50 flex items-center gap-2 px-3 h-11">
      <CustomButton
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-md hover:bg-muted"
        onClick={() => scrollCategories("left")}
        title="Scroll left"
      >
        <ChevronRight className="h-4.5 w-4.5 transform rotate-180 text-muted-foreground" />
      </CustomButton>

      <ScrollArea className="flex-1 h-9.5 overflow-hidden" ref={categoryScrollRef as any}>
        <div className="flex gap-2 px-0.5 h-9.5 items-center">
          <CustomButton
            variant="unstyled"
            size="unstyled"
            onClick={() => dispatch(setSelectedCategory(null))}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-[8px] text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer h-8 flex items-center border",
              selectedCategory === null
                ? "bg-primary text-primary-foreground border-primary shadow-2xs font-extrabold"
                : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            All Categories
          </CustomButton>

          {categoriesLoading ? (
            <div className="flex items-center gap-1.5 px-2 h-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                Loading categories...
              </span>
            </div>
          ) : (
            categories.map((category) => (
              <CustomButton
                variant="unstyled"
                size="unstyled"
                key={category.id}
                onClick={() => dispatch(setSelectedCategory(category))}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-[8px] text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap cursor-pointer h-8 flex items-center border",
                  selectedCategory?.id === category.id
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs font-extrabold"
                    : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={category.name}
              >
                {category.name}
              </CustomButton>
            ))
          )}
        </div>
      </ScrollArea>

      <CustomButton
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-md hover:bg-muted"
        onClick={() => scrollCategories("right")}
        title="Scroll right"
      >
        <ChevronRight className="h-4.5 w-4.5 text-muted-foreground" />
      </CustomButton>
    </div>
  );
}
