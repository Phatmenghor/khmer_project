"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <CustomButton
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-14 right-4 z-50 h-6 w-6 rounded-full shadow-lg transition-all duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-11 opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
      icon={<ArrowUp className="h-3 w-3" />}
    />
  );
}
