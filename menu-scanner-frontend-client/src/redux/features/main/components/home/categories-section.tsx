/**
 * CategoriesSection Component
 * Features:
 * - Fixed 2-row grid layout across all screen sizes
 * - Responsive columns (2-6)
 * - Browse categories for quick navigation
 * - Skeleton loading placeholders
 */

import React, { useState, useEffect } from "react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryGridSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  SectionHeader,
  SectionWrapper,
  ViewAllButton,
} from "@/components/shared/common/section-header";

interface CategoriesSectionProps {
  categories: CategoriesResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
}

/** Default section title for categories */
const DEFAULT_TITLE = "Shop by Category";
const DEFAULT_SUBTITLE = "Browse products by category";

/**
 * Memoized component to prevent unnecessary re-renders
 * Only re-renders when props actually change (categories, loading, error, title)
 */
const CategoriesSectionComponent = ({
  categories,
  loading,
  error,
  title = DEFAULT_TITLE,
}: CategoriesSectionProps) => {
  const [limit, setLimit] = useState(12);

  /**
   * Calculate max categories to display based on screen size
   * Always shows 2 rows to maintain consistent home page layout
   */
  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;

      // Calculate: columns × 2 rows
      if (width < 640) {
        setLimit(4); // 2 cols × 2 rows (mobile)
      } else if (width < 768) {
        setLimit(6); // 3 cols × 2 rows (small tablet)
      } else if (width < 1024) {
        setLimit(8); // 4 cols × 2 rows (tablet)
      } else if (width < 1280) {
        setLimit(10); // 5 cols × 2 rows (desktop)
      } else {
        setLimit(12); // 6 cols × 2 rows (large desktop)
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const displayCategories = categories?.slice(0, limit) || [];

  // Loading state - show skeleton placeholders
  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader
          title={title}
          subtitle={DEFAULT_SUBTITLE}
        />
        <CategoryGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  // Error or empty state - don't show section
  if (error || !displayCategories || displayCategories.length === 0) {
    if (error) {
      console.error("CategoriesSection error:", error);
    }
    return null;
  }

  // Content state with categories
  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle={DEFAULT_SUBTITLE}
      />

      {/* Responsive Category Grid: 2 cols (mobile) to 6 cols (desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayCategories.map((category) => (
          <CategoryCard
            key={`category-${category.id}`}
            category={category}
          />
        ))}
      </div>

      {/* Show "View All" button - always display for categories */}
      <ViewAllButton href="/categories" text="View All Categories" />
    </SectionWrapper>
  );
};

/**
 * Export memoized component
 * Prevents re-renders when parent updates but props remain the same
 */
export const CategoriesSection = React.memo(CategoriesSectionComponent);
