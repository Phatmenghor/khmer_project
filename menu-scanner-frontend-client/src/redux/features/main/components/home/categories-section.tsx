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

export const CategoriesSection = ({
  categories,
  loading,
  error,
  title = "Shop by Category",
}: CategoriesSectionProps) => {
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;

      // Show only 2 rows for better UI/UX
      if (width < 640) setLimit(4); // 2 columns × 2 rows
      else if (width < 768) setLimit(6); // 3 columns × 2 rows
      else if (width < 1024) setLimit(8); // 4 columns × 2 rows
      else if (width < 1280) setLimit(10); // 5 columns × 2 rows
      else setLimit(12); // 6 columns × 2 rows
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const displayCategories = categories?.slice(0, limit) || [];

  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader title={title} subtitle="Browse products by category" />
        <CategoryGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  if (error || !displayCategories || displayCategories.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader title={title} subtitle="Browse products by category" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <ViewAllButton href="/categories" text="View All Categories" />
    </SectionWrapper>
  );
};
