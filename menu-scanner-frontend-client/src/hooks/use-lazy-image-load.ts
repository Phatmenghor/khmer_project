"use client";

import { useEffect, useRef, useState } from 'react';

interface UseLazyImageLoadOptions {
  threshold?: number;
  rootMargin?: string;
  onIntersect?: () => void;
}


export function useLazyImageLoad(options: UseLazyImageLoadOptions = {}) {
  const {
    threshold = 0,
    rootMargin = '50px',
    onIntersect = () => {},
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenInView(true);
          onIntersect();

        } else {

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
