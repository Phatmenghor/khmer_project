"use client";

import { memo } from "react";
import { Search, X } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Input } from "@/components/ui/input";

interface NavbarSearchProps {
  mobileSearchOpen: boolean;
  onMobileSearchOpen: (open: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchPlaceholder: string;
  onSearchSubmit: (e: React.FormEvent) => void;
  mobileSearchRef: React.RefObject<HTMLInputElement>;
}

function NavbarSearchComponent({
  mobileSearchOpen,
  onMobileSearchOpen,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  onSearchSubmit,
  mobileSearchRef,
}: NavbarSearchProps) {
  return (
    <>
      {/* Mobile Search */}
      {mobileSearchOpen ? (
        <form
          onSubmit={onSearchSubmit}
          className="lg:hidden flex items-center gap-1 w-full h-10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            <Input
              ref={mobileSearchRef}
              type="search"
              placeholder={searchPlaceholder}
              className="pl-7 w-full h-7 bg-muted/50"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </div>
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onMobileSearchOpen(false)}
          >
            <X className="h-3 w-3" />
          </CustomButton>
        </form>
      ) : null}

      {/* Desktop Search */}
      <form
        onSubmit={onSearchSubmit}
        className="hidden lg:flex flex-1 max-w-xl"
      >
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-7 w-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
      </form>
    </>
  );
}

export const NavbarSearch = memo(NavbarSearchComponent);
