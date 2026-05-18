import { useRef, useCallback, useEffect } from "react";


export function useScrollAnchor(isLoading: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorProductKeyRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);


  const savePositionNow = useCallback(() => {
    if (!containerRef.current) return;

    isLoadingRef.current = true;


    const productCards = containerRef.current.querySelectorAll('[data-product-key]');
    if (productCards.length === 0) return;


    let lastVisibleKey: string | null = null;

    productCards.forEach((card) => {
      const rect = (card as HTMLElement).getBoundingClientRect();

      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        lastVisibleKey = card.getAttribute('data-product-key');
      }
    });


    if (lastVisibleKey) {
      anchorProductKeyRef.current = lastVisibleKey;
    }
  }, []);


  useEffect(() => {
    if (!isLoading && isLoadingRef.current && anchorProductKeyRef.current && containerRef.current) {
      isLoadingRef.current = false;

      requestAnimationFrame(() => {

        const anchorElement = containerRef.current?.querySelector(
          `[data-product-key="${anchorProductKeyRef.current}"]`
        ) as HTMLElement;

        if (anchorElement) {

          anchorElement.scrollIntoView({
            behavior: "instant",
            block: "start",
          });
        }


        anchorProductKeyRef.current = null;
      });
    }
  }, [isLoading]);

  return {
    containerRef,
    savePositionNow,
  };
}


export function useScrollAnchorManual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const savedScrollPositionRef = useRef<number | null>(null);
  const savedHeightRef = useRef<number | null>(null);

  const savePosition = useCallback(() => {
    savedScrollPositionRef.current = window.scrollY;
    if (containerRef.current) {
      savedHeightRef.current = containerRef.current.scrollHeight;
    }
  }, []);

  const restorePosition = useCallback(() => {
    requestAnimationFrame(() => {
      const savedPosition = savedScrollPositionRef.current;
      const savedHeight = savedHeightRef.current;

      if (savedPosition !== null && savedHeight !== null && containerRef.current) {
        const currentHeight = containerRef.current.scrollHeight;
        const heightDifference = currentHeight - savedHeight;

        window.scrollTo({
          top: savedPosition + heightDifference,
          behavior: "instant",
        });
      }

      savedScrollPositionRef.current = null;
      savedHeightRef.current = null;
    });
  }, []);

  return {
    containerRef,
    savePosition,
    restorePosition,
  };
}
