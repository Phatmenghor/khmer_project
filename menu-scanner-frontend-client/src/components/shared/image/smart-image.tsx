"use client";

import { memo, useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
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
  extends Omit<
    ImageProps,
    "src" | "alt" | "onLoad" | "onError" | "fill" | "className" | "loading"
  > {
  /** Image source. Accepts remote URLs, public paths, blob: and data: URLs. */
  src?: string | null;
  alt: string;
  /** Fallback shown when src is missing or fails to load. Defaults to appImages.noImage. */
  fallbackSrc?: string;
  /** Fill the parent container (parent must be `relative`). */
  fill?: boolean;
  /** Loading strategy, ignored when `priority` is set. */
  loading?: "eager" | "lazy";
  /** Tailwind rounding applied to both the skeleton and the image. */
  rounded?: Rounded;
  /** CSS object-fit behavior. */
  objectFit?: ObjectFit;
  /** Class applied to the <img>/<Image> element itself. */
  className?: string;
  /** Class applied to the wrapping container. */
  containerClassName?: string;
  /** Class applied to the skeleton placeholder. */
  skeletonClassName?: string;
  /** Hide the loading skeleton entirely. */
  showSkeleton?: boolean;
  /**
   * Force a plain <img> tag instead of next/image. Use for blob/data URLs,
   * or contexts that capture the DOM (html2canvas, jsPDF) where next/image's
   * lazy-loading/blur-up behavior breaks capture.
   */
  raw?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

function isLocalPreviewUrl(src?: string | null) {
  return !!src && (src.startsWith("blob:") || src.startsWith("data:"));
}

/**
 * Single image component for the whole app: handles loading skeleton,
 * error fallback, static + remote/dynamic sources, and responsive sizing.
 * Wraps next/image by default; falls back to a plain <img> for blob/data
 * URLs or when `raw` is explicitly requested.
 */
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
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const sanitizedSrc = sanitizeImageUrl(src, fallbackSrc);
  const resolvedSrc = errored ? fallbackSrc : sanitizedSrc;
  const usePlainImg = raw || isLocalPreviewUrl(resolvedSrc);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  const handleLoad = () => {
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
    loaded ? "opacity-100" : "opacity-0",
    className
  );

  return (
    <div
      className={cn(
        fill ? "relative w-full h-full overflow-hidden" : "relative inline-block overflow-hidden",
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

      {usePlainImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={alt}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={cn(fill && "absolute inset-0 w-full h-full", imgClassName)}
          loading={priority ? "eager" : loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          {...rest}
          src={resolvedSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          sizes={sizes ?? (fill ? "100vw" : undefined)}
          priority={priority}
          loading={priority ? undefined : loading}
          unoptimized={unoptimized}
          className={imgClassName}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

export const SmartImage = memo(SmartImageComponent);
