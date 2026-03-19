"use client";

import { useEffect, useRef, useState } from 'react';

interface UseLazyImageLoadOptions {
  threshold?: number;
  rootMargin?: string;
  onIntersect?: () => void;
}

/**
 * Hook that uses IntersectionObserver to lazy-load images.
 *
 * Benefits:
 * - Images only load when they're about to enter the viewport
 * - Reduces bandwidth consumption
 * - Faster initial page load
 * - Perfect for infinite scroll product lists
 *
 * Usage:
 * ```tsx
 * const { ref, isInView } = useLazyImageLoad();
 *
 * return (
 *   <div ref={ref}>
 *     {isInView && <Image src={url} ... />}
 *   </div>
 * );
 * ```
 */
export function useLazyImageLoad(options: UseLazyImageLoadOptions = {}) {
  const {
    threshold = 0,
    rootMargin = '50px', // Start loading 50px before image enters viewport
    onIntersect = () => {},
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false); // Track if ever loaded

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenInView(true); // Keep track that it was loaded once
          onIntersect();
          // Optionally: observer.unobserve(entry.target); // Stop observing after first load
        } else {
          // setIsInView(false); // Uncomment to unload when out of view (aggressive)
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, onIntersect]);

  return { ref, isInView, hasBeenInView };
}

/**
 * Hook for observing multiple elements (e.g., in a grid of product cards).
 * Returns a map of element refs to their visibility state.
 */
export function useLazyLoadObserver(options: UseLazyImageLoadOptions = {}) {
  const {
    threshold = 0,
    rootMargin = '50px',
  } = options;

  const refsMap = useRef<Map<string, HTMLElement>>(new Map());
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newVisibleIds = new Set(visibleIds);

        entries.forEach((entry) => {
          // Find the ID associated with this element
          const elementId = entry.target.getAttribute('data-lazy-id');
          if (elementId) {
            if (entry.isIntersecting) {
              newVisibleIds.add(elementId);
            } else {
              newVisibleIds.delete(elementId);
            }
          }
        });

        setVisibleIds(newVisibleIds);
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observe all registered elements
    refsMap.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, visibleIds]);

  const registerElement = (id: string, element: HTMLElement | null) => {
    if (element) {
      element.setAttribute('data-lazy-id', id);
      refsMap.current.set(id, element);
    } else {
      refsMap.current.delete(id);
    }
  };

  const isVisible = (id: string) => visibleIds.has(id);

  return { registerElement, isVisible, visibleIds };
}
