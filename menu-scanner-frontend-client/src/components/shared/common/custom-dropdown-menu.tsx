
"use client";

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

      {}
      {isOpen && (
        <div
          ref={dropdownRef}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
          className={cn(
            "absolute top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {}
          {header && (
            <>
              <div className="p-3">{header}</div>
              <div className="h-px bg-border" />
            </>
          )}

          {}
          <div className="py-2">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {}
                {section.label && (
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </div>
                )}

                {}
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <button
                      onClick={() => handleItemClick(item.onClick)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm transition-colors cursor-pointer",
                        "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none",
                        item.variant === "destructive"
                          ? "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                          : "text-foreground"
                      )}
                    >
                      {item.icon && (
                        <span className="mr-3 flex-shrink-0 text-muted-foreground">
                          {item.icon}
                        </span>
                      )}
                      <span
                        className={
                          item.variant === "destructive" ? "font-medium" : ""
                        }
                      >
                        {item.label}
                      </span>
                    </button>

                    {}
                    {item.separator && <div className="my-1 h-px bg-border" />}
                  </div>
                ))}

                {}
                {sectionIndex < sections.length - 1 && (
                  <div className="my-1 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
