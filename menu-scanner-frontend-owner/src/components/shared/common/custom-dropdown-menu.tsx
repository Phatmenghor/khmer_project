
"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface DropdownMenuSection {
  label?: string;
  items: DropdownMenuItem[];
}

interface CustomDropdownMenuProps {
  trigger: React.ReactNode;
  sections: DropdownMenuSection[];
  header?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  openOnHover?: boolean;
  hoverDelay?: number;
}

export function CustomDropdownMenu({
  trigger,
  sections,
  header,
  align = "right",
  className,
  openOnHover = false,
  hoverDelay = 200,
}: CustomDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);


  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleItemClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };


  const handleMouseEnter = () => {
    if (!openOnHover) return;


    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }


    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, hoverDelay);
  };

  const handleMouseLeave = () => {
    if (!openOnHover) return;


    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }


    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (!openOnHover) return;


    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    if (!openOnHover) return;


    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleClick = () => {
    if (openOnHover) {

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setIsOpen(true);
    } else {

      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      {}
      <div
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
          className={cn(
            "absolute top-full mt-2 w-52 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 space-y-1",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {/* Header */}
          {header && (
            <div className="p-2.5 bg-muted/40 rounded-xl border border-border/40 mb-1">
              {header}
            </div>
          )}

          {/* Sections */}
          <div>
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-0.5">
                {/* Section Label */}
                {section.label && (
                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </div>
                )}

                {/* Items */}
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <CustomButton
                      variant="unstyled"
                      size="unstyled"
                      onClick={() => handleItemClick(item.onClick)}
                      className={cn(
                        "w-full flex items-center px-2.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer",
                        "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none",
                        item.variant === "destructive"
                          ? "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                          : "text-foreground"
                      )}
                    >
                      {item.icon && (
                        <span className="mr-2 flex-shrink-0 text-muted-foreground">
                          {item.icon}
                        </span>
                      )}
                      <span className="font-semibold">{item.label}</span>
                    </CustomButton>

                    {item.separator && <div className="my-1 h-px bg-border/40" />}
                  </div>
                ))}

                {sectionIndex < sections.length - 1 && (
                  <div className="my-1 h-px bg-border/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
