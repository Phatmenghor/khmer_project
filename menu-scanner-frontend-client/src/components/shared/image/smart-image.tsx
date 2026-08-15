"use client";

import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { sanitizeImageUrl } from "@/utils/common/common";

type Rounded = "none" | "sm" | "md" | "lg" | "xl" | "full";
type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

const roundedClassMap: Record<Rounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const objectFitClassMap: Record<ObjectFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
};

export interface SmartImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** Image source. Accepts remote URLs, public paths, blob: and data: URLs. */
  src?: string | null;
  alt: string;
  /** Fallback shown when src is missing or fails to load. Defaults to appImages.noImage. */
  fallbackSrc?: string;
  /** Fill the parent container (parent must be `relative`). */
  fill?: boolean;
  /** Force eager loading instead of lazy loading. */
  priority?: boolean;
  /** Loading strategy. */
  loading?: "eager" | "lazy";
  /** Tailwind rounding applied to both the skeleton and the image. */
  rounded?: Rounded;
  /** CSS object-fit behavior. */
  objectFit?: ObjectFit;
  /** Class applied to the <img> element itself. */
  className?: string;
  /** Class applied to the wrapping container. */
  containerClassName?: string;
  /** Class applied to the skeleton placeholder. */
  skeletonClassName?: string;
  /** Hide the loading skeleton entirely. */
  showSkeleton?: boolean;
  raw?: boolean;
  unoptimized?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Single image component for the whole app: handles loading skeleton,
 * error fallback, static + remote/dynamic sources, and responsive sizing.
 */
const loadedUrlsCache = new Set<string>();

function SmartImageComponent({
  src,
  alt,
  fallbackSrc = appImages.noImage,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  loading = "lazy",
  rounded = "none",
  objectFit = "cover",
  className,
  containerClassName,
  skeletonClassName,
  showSkeleton = true,
  raw,
  unoptimized,
  onLoad,
  onError,
  style,
  ...rest
}: SmartImageProps) {
  const sanitizedSrc = sanitizeImageUrl(src, fallbackSrc);
  const [loaded, setLoaded] = useState(() => {
    return !showSkeleton || (!!sanitizedSrc && loadedUrlsCache.has(sanitizedSrc));
  });
  const [errored, setErrored] = useState(false);

  const resolvedSrc = errored ? fallbackSrc : sanitizedSrc;

  useEffect(() => {
    const isCached = !showSkeleton || (!!sanitizedSrc && loadedUrlsCache.has(sanitizedSrc));
    setLoaded(isCached);
    setErrored(false);
  }, [src, sanitizedSrc, showSkeleton]);

  const handleLoad = () => {
    if (sanitizedSrc) {
      loadedUrlsCache.add(sanitizedSrc);
    }
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!errored && resolvedSrc !== fallbackSrc) {
      setErrored(true);
      setLoaded(false);
    } else {
      setLoaded(true);
    }
    onError?.();
  };

  const imgClassName = cn(
    objectFitClassMap[objectFit],
    roundedClassMap[rounded],
    "transition-opacity duration-300",
    fill ? "absolute inset-0 w-full h-full" : "w-full h-full",
    !showSkeleton || loaded ? "opacity-100" : "opacity-0",
    className
  );

  return (
    <div
      className={cn(
        fill ? "absolute inset-0 w-full h-full overflow-hidden" : "relative inline-block overflow-hidden",
        roundedClassMap[rounded],
        containerClassName
      )}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {showSkeleton && !loaded && (
        <Skeleton
          className={cn(
            "absolute inset-0 w-full h-full",
            roundedClassMap[rounded],
            skeletonClassName
          )}
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...rest}
        src={resolvedSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading={priority ? "eager" : loading}
        decoding="async"
        className={imgClassName}
        style={{
          ...(!fill ? { width: "auto", height: "auto" } : {}),
          ...style,
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

export const SmartImage = memo(SmartImageComponent);
