import React, { useState, useEffect } from "react";
import { BrandCard } from "@/components/shared/card/brand-card";
import { BrandGridSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import {
  SectionHeader,
  SectionWrapper,
  ViewAllButton,
} from "@/components/shared/common/section-header";

interface BrandsSectionProps {
  brands: BrandResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
}

export const BrandsSection = ({
  brands,
  loading,
  error,
  title = "Shop by Brand",
}: BrandsSectionProps) => {
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;

      if (width < 640) setLimit(20);
      else if (width < 768) setLimit(25);
      else if (width < 1024) setLimit(30);
      else if (width < 1280) setLimit(40);
      else setLimit(50);
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const displayBrands = brands?.slice(0, limit) || [];

  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader title={title} />
        <BrandGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  if (error || !displayBrands || displayBrands.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader title={title} />

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {displayBrands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      {brands.length > limit && (
        <ViewAllButton href="/brands" text="View All Brands" />
      )}
    </SectionWrapper>
  );
};
