"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { Badge } from "@/components/ui/badge";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { sanitizeImageUrl } from "@/utils/common/common";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

interface ProductImageGalleryProps {
  product: ProductDetailResponseModel;
  hasDiscount?: boolean;
  discountPercent?: number;
}

export function ProductImageGallery({
  product,
  hasDiscount = false,
  discountPercent = 0,
}: ProductImageGalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Collect all images (1 mainImage + extra images in product.images)
  const allImages = useMemo(() => {
    if (!product) return [];
    const list: { id: string; imageUrl: string }[] = [];
    const seen = new Set<string>();

    const mainUrl = sanitizeImageUrl(
      product.mainImage?.o || product.mainImage?.md || product.mainImage?.sm,
      appImages.noImage,
    );
    if (mainUrl && mainUrl !== appImages.noImage) {
      list.push({ id: "main", imageUrl: mainUrl });
      seen.add(mainUrl);
    }

    if (product.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
      );

      sortedImages.forEach((img) => {
        const url = sanitizeImageUrl(
          img.image?.o || img.image?.md || img.image?.sm,
          appImages.noImage,
        );
        if (url && url !== appImages.noImage && !seen.has(url)) {
          list.push({ id: img.id || url, imageUrl: url });
          seen.add(url);
        }
      });
    }

    if (list.length === 0) {
      list.push({ id: "fallback", imageUrl: appImages.noImage });
    }

    return list;
  }, [product]);

  const activeImage = useMemo(() => {
    if (allImages.length === 0) return appImages.noImage;
    return allImages[currentImageIndex]?.imageUrl || selectedImage || allImages[0].imageUrl;
  }, [allImages, currentImageIndex, selectedImage]);

  // Sync URL search params with Lightbox modal state
  useEffect(() => {
    if (!mounted || allImages.length === 0) return;
    const lightboxParam = searchParams.get("lightbox");
    const imgParam = searchParams.get("img");

    if (lightboxParam === "true" || lightboxParam === "1") {
      const idx = parseInt(imgParam || "0", 10);
      const validIdx = !isNaN(idx) && idx >= 0 && idx < allImages.length ? idx : 0;
      setLightboxIndex(validIdx);
      setCurrentImageIndex(validIdx);
      setLightboxOpen(true);
    } else {
      setLightboxOpen(false);
      setIsZoomed(false);
    }
  }, [searchParams, allImages, mounted]);

  // Set initial main image when product changes
  useEffect(() => {
    if (allImages.length > 0) {
      setSelectedImage(allImages[0].imageUrl);
      setCurrentImageIndex(0);
    }
  }, [allImages]);

  const selectImage = useCallback(
    (url: string, index: number) => {
      setCurrentImageIndex(index);
      if (url !== selectedImage) {
        setSelectedImage(url);
      }
      thumbRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [selectedImage],
  );

  const scrollThumbsUp = () => {
    thumbScrollRef.current?.scrollBy({ top: -140, behavior: "smooth" });
  };
  const scrollThumbsDown = () => {
    thumbScrollRef.current?.scrollBy({ top: 140, behavior: "smooth" });
  };

  const prevImage = () => {
    const idx = currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1;
    selectImage(allImages[idx].imageUrl, idx);
  };

  const nextImage = () => {
    const idx = currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1;
    selectImage(allImages[idx].imageUrl, idx);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setCurrentImageIndex(index);
    setIsZoomed(false);
    setLightboxOpen(true);

    // Sync URL search params
    const params = new URLSearchParams(searchParams.toString());
    params.set("lightbox", "true");
    params.set("img", index.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsZoomed(false);

    // Sync URL search params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lightbox");
    params.delete("img");
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const selectLightboxImage = useCallback((index: number) => {
    setLightboxIndex(index);
    setCurrentImageIndex(index);

    const params = new URLSearchParams(searchParams.toString());
    params.set("lightbox", "true");
    params.set("img", index.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        selectLightboxImage(lightboxIndex === allImages.length - 1 ? 0 : lightboxIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        selectLightboxImage(lightboxIndex === 0 ? allImages.length - 1 : lightboxIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxIndex, allImages.length, selectLightboxImage]);

  // Wheel scroll & Touch swipe handlers for Lightbox modal
  const wheelDebounceRef = useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    if (isZoomed || allImages.length <= 1) return;
    const now = Date.now();
    if (now - wheelDebounceRef.current < 350) return;

    if (e.deltaY > 30 || e.deltaX > 30) {
      wheelDebounceRef.current = now;
      selectLightboxImage(lightboxIndex === allImages.length - 1 ? 0 : lightboxIndex + 1);
    } else if (e.deltaY < -30 || e.deltaX < -30) {
      wheelDebounceRef.current = now;
      selectLightboxImage(lightboxIndex === 0 ? allImages.length - 1 : lightboxIndex - 1);
    }
  };

  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || isZoomed || allImages.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;

    if (deltaX > 40) {
      selectLightboxImage(lightboxIndex === allImages.length - 1 ? 0 : lightboxIndex + 1);
    } else if (deltaX < -40) {
      selectLightboxImage(lightboxIndex === 0 ? allImages.length - 1 : lightboxIndex - 1);
    }
    touchStartXRef.current = null;
  };

  if (!product) return null;

  return (
    <div>
      <div className="flex gap-2.5 flex-col sm:flex-row">
        {/* Desktop Vertical Thumb Strip */}
        {allImages.length > 1 && (
          <div className="hidden sm:flex flex-col items-center justify-between w-[54px] sm:w-[60px] lg:w-[66px] shrink-0 h-[250px] sm:h-[290px] md:h-[310px] lg:h-[350px]">
            <CustomButton
              variant="unstyled"
              size="unstyled"
              onClick={scrollThumbsUp}
              className="w-full h-5 rounded-md flex items-center justify-center hover:bg-muted text-foreground/80 hover:text-foreground transition-colors cursor-pointer shrink-0 border border-border/40 mb-1"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </CustomButton>

            <div
              ref={thumbScrollRef}
              className="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] space-y-2 py-1.5 px-0.5 scroll-smooth"
            >
              {allImages.map((img, idx) => {
                const isActive = idx === currentImageIndex;
                return (
                  <CustomButton
                    variant="unstyled"
                    size="unstyled"
                    key={idx}
                    ref={(el) => { thumbRefs.current[idx] = el; }}
                    onClick={() => selectImage(img.imageUrl, idx)}
                    className={cn(
                      "relative w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[60px] lg:h-[60px] rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer block border-2",
                      isActive
                        ? "border-primary ring-2 ring-primary/30 shadow-md scale-[1.03] opacity-100"
                        : "border-border/60 opacity-60 hover:opacity-100 hover:border-primary/50",
                    )}
                  >
                    <SmartImage
                      src={img.imageUrl}
                      alt={`View ${idx + 1}`}
                      fill
                      raw
                      unoptimized
                      showSkeleton={false}
                      sizes="60px"
                      className="object-cover"
                    />
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/10 transition-opacity duration-200" />
                    )}
                  </CustomButton>
                );
              })}
            </div>

            <CustomButton
              variant="unstyled"
              size="unstyled"
              onClick={scrollThumbsDown}
              className="w-full h-5 rounded-md flex items-center justify-center hover:bg-muted text-foreground/80 hover:text-foreground transition-colors cursor-pointer shrink-0 border border-border/40 mt-1"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </CustomButton>
          </div>
        )}

        {/* Main Product Cover Image Container */}
        <div
          onClick={() => openLightbox(currentImageIndex)}
          className={cn(
            "relative rounded-2xl overflow-hidden bg-muted/20 border border-border/70 group shadow-xs flex-1 cursor-zoom-in",
            "h-[250px] sm:h-[290px] md:h-[310px] lg:h-[350px]",
          )}
        >
          {/* Main Product Image */}
          <SmartImage
            key={`main-${currentImageIndex}`}
            src={activeImage}
            alt={product.name}
            fill
            raw
            unoptimized
            showSkeleton={false}
            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 40vw"
            className="object-cover transition-all duration-300 group-hover:scale-[1.03]"
            priority
          />

          {hasDiscount && discountPercent > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-3.5 left-3.5 text-xs font-black px-2.5 py-1 shadow-md bg-gradient-to-r from-red-600 to-rose-500 border-none z-10"
            >
              -{discountPercent}% OFF
            </Badge>
          )}

          {allImages.length > 1 && (
            <>
              <CustomButton
                variant="unstyled"
                size="unstyled"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </CustomButton>
              <CustomButton
                variant="unstyled"
                size="unstyled"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-background/85 hover:bg-background p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </CustomButton>
            </>
          )}
        </div>
      </div>

      {/* Full Screen Lightbox Modal Portaled to document.body */}
      {lightboxOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200"
          onClick={closeLightbox}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Lightbox Header */}
          <div
            className="w-full flex items-center justify-between px-2 py-1 shrink-0 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-white text-xs font-extrabold px-2.5 py-0.5 shadow-sm">
                {lightboxIndex + 1} / {allImages.length}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/10 text-white border-white/20 text-xs font-bold px-2 py-0.5 cursor-pointer hover:bg-white/20"
                onClick={() => setIsZoomed((z) => !z)}
              >
                {isZoomed ? "Zoom 2.0x (Click to Reset)" : "Click Image to Zoom 2x"}
              </Badge>
              <span className="text-white/80 text-xs font-bold truncate max-w-[160px] sm:max-w-md hidden sm:inline">
                {product.name}
              </span>
            </div>
            <CustomButton
              variant="unstyled"
              size="unstyled"
              onClick={closeLightbox}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </CustomButton>
          </div>

          {/* Lightbox Main Image & Prev/Next Controls */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-2 overflow-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "relative w-full h-full flex items-center justify-center transition-transform duration-300 transform-gpu",
                isZoomed ? "scale-[1.8] sm:scale-[2] cursor-zoom-out" : "scale-100 cursor-zoom-in",
              )}
              onClick={() => setIsZoomed((z) => !z)}
            >
              <SmartImage
                key={`lightbox-${lightboxIndex}`}
                src={allImages[lightboxIndex]?.imageUrl}
                alt={product.name}
                fill
                raw
                unoptimized
                showSkeleton={false}
                className="object-contain p-2"
              />
            </div>

            {allImages.length > 1 && (
              <>
                <CustomButton
                  variant="unstyled"
                  size="unstyled"
                  onClick={() => selectLightboxImage(lightboxIndex === 0 ? allImages.length - 1 : lightboxIndex - 1)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2.5 sm:p-3.5 rounded-full shadow-xl transition-all border border-white/20 hover:scale-110 z-10 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </CustomButton>
                <CustomButton
                  variant="unstyled"
                  size="unstyled"
                  onClick={() => selectLightboxImage(lightboxIndex === allImages.length - 1 ? 0 : lightboxIndex + 1)}
                  className="absolute right-2 sm:left-auto sm:right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2.5 sm:p-3.5 rounded-full shadow-xl transition-all border border-white/20 hover:scale-110 z-10 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </CustomButton>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Gallery Strip */}
          <div
            className="w-full flex justify-center z-10 pb-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 overflow-x-auto py-2 px-3 max-w-full bg-black/60 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
              {allImages.map((img, idx) => {
                const isActive = idx === lightboxIndex;
                return (
                  <CustomButton
                    variant="unstyled"
                    size="unstyled"
                    key={idx}
                    onClick={() => selectLightboxImage(idx)}
                    className={cn(
                      "relative w-13 h-13 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer border-2",
                      isActive
                        ? "border-primary ring-2 ring-primary/40 scale-105 shadow-lg opacity-100"
                        : "border-white/20 opacity-50 hover:opacity-100",
                    )}
                  >
                    <SmartImage
                      src={img.imageUrl}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      raw
                      unoptimized
                      showSkeleton={false}
                      sizes="70px"
                      className="object-cover"
                    />
                  </CustomButton>
                );
              })}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
