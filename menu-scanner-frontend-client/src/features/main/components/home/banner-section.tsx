"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import React, { useEffect, useRef, useState } from "react";
import { SmartImage } from "@/components/shared/image/smart-image";
import { BannerResponseModel } from "@/features/master-data/store/models/response/banner-response";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";




interface BannerSectionProps {
  banners: BannerResponseModel[];
  loading: boolean;
  error: string | null;
}


const BannerSectionComponent = ({
  banners,
  loading,
  error,
}: BannerSectionProps) => {
  const [current, setCurrent] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>();


  // Guard against SSR — Autoplay accesses `window` on init, so only
  // create it on the client. The ref stays stable across re-renders.
  const autoplayPlugin = useRef(
    typeof window !== "undefined"
      ? Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false, playOnInit: true })
      : null,
  );

  useEffect(() => {
    if (!carouselApi) return;

    setCurrent(carouselApi.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (loading) {
    return (
      <div className="w-full mb-3 sm:mb-5">
        <div className="relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-[20px] sm:rounded-[24px] overflow-hidden bg-muted border border-border/60 shadow-2xs">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      </div>
    );
  }

  if (error || !banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-3 sm:mb-5">
      <div className="relative">
        <Carousel
          setApi={setCarouselApi}
          plugins={autoplayPlugin.current ? [autoplayPlugin.current] : []}
          className="w-full"
          opts={{
            loop: true,
            align: "start",
            duration: 25,
            skipSnaps: false,
          }}
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id + "-" + index}>
                <div className="relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-border/60 shadow-2xs group">
                  <SmartImage
                    src={banner.image?.md}
                    alt={banner.businessName || "Banner"}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-1 sm:left-3 bg-white/90 hover:bg-white border-none shadow-lg" />
              <CarouselNext className="right-1 sm:right-3 bg-white/90 hover:bg-white border-none shadow-lg" />
            </>
          )}
        </Carousel>

        {banners.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1 pointer-events-none">
            {(() => {
              const maxDots = 12;
              const totalBanners = banners.length;

              if (totalBanners <= maxDots) {

                return banners.map((_, idx) => (
                  <CustomButton variant="unstyled" size="unstyled"
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      carouselApi?.scrollTo(idx);
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all duration-200 pointer-events-auto",
                      current === idx
                        ? "w-5 bg-primary"
                        : "w-1 bg-white/50 hover:bg-white/80",
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ));
              }


              const half = Math.floor(maxDots / 2);
              let startIdx = Math.max(0, current - half);
              let endIdx = Math.min(totalBanners, startIdx + maxDots);


              if (endIdx - startIdx < maxDots) {
                startIdx = Math.max(0, endIdx - maxDots);
              }

              return Array.from({ length: endIdx - startIdx }, (_, i) => {
                const idx = startIdx + i;
                return (
                  <CustomButton variant="unstyled" size="unstyled"
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      carouselApi?.scrollTo(idx);
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all duration-200 pointer-events-auto",
                      current === idx
                        ? "w-5 bg-primary"
                        : "w-1 bg-white/50 hover:bg-white/80",
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};


export const BannerSection = React.memo(BannerSectionComponent);
