import { useEffect, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = "200px 0px",
}: UseInfiniteScrollOptions) => {
  const [targetEl, setTargetEl] = useState<HTMLDivElement | null>(null);

  // Callback ref: fires when the sentinel div mounts/unmounts
  // This ensures the observer is created after the element is in the DOM
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    setTargetEl(node);
  }, []);

  useEffect(() => {
    if (!targetEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(targetEl);

    return () => observer.disconnect();
  }, [targetEl, hasMore, isLoading, onLoadMore, threshold, rootMargin]);

  return { observerTarget };
};
