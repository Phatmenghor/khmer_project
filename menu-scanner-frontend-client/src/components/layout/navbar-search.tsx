"use client";

import { memo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          className="lg:hidden flex items-center gap-2 w-full h-14"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={mobileSearchRef}
              type="search"
              placeholder={searchPlaceholder}
              className="pl-10 w-full h-10 bg-muted/50"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onMobileSearchOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </form>
      ) : null}

      {/* Desktop Search */}
      <form
        onSubmit={onSearchSubmit}
        className="hidden lg:flex flex-1 max-w-xl"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-10 w-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
      </form>
    </>
  );
}

export const NavbarSearch = memo(NavbarSearchComponent);
