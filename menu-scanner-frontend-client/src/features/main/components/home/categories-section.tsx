


import React, { useState, useEffect } from "react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryGridSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";
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


const DEFAULT_TITLE = "Shop by Category";
const DEFAULT_SUBTITLE = "Browse products by category";


const CategoriesSectionComponent = ({
  categories,
  loading,
  error,
  title = DEFAULT_TITLE,
}: CategoriesSectionProps) => {
  const [limit, setLimit] = useState(12);


  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;


      if (width < 640) {
        setLimit(4);
      } else if (width < 768) {
        setLimit(6);
      } else if (width < 1024) {
        setLimit(8);
      } else if (width < 1280) {
        setLimit(10);
      } else {
        setLimit(12);
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const displayCategories = categories?.slice(0, limit) || [];


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


  if (error || !displayCategories || displayCategories.length === 0) {
    return null;
  }


  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle={DEFAULT_SUBTITLE}
      />

      {}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {displayCategories.map((category, index) => (
          <CategoryCard
            key={`category-${category.id}`}
            category={category}
            loading="eager"
          />
        ))}
      </div>

      {}
      <ViewAllButton href="/categories" text="View All Categories" />
    </SectionWrapper>
  );
};


export const CategoriesSection = React.memo(CategoriesSectionComponent);
