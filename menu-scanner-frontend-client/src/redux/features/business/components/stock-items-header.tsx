import React from "react";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/shared/button/action-button";
import { useIsMobile } from "@/redux/store/use-mobile";

interface StockItemsHeaderProps {
  title: string;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode; // Filters go here
}

/**
 * Custom header for Stock Items page
 * Keeps search on left row 1, Add button on right row 1, filters wrap below
 */
export const StockItemsHeader: React.FC<StockItemsHeaderProps> = ({
  title,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  children,
}) => {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardContent className="py-3 sm:py-5">
        {/* Title Section with Back Button */}
        <div className="flex items-center gap-2 mb-3">
          {isMobile && (
            <ActionButton
              size="icon"
              icon={<ArrowLeft className="w-10 h-10" />}
              tooltip="Back"
              onClick={() => router.back()}
              variant="ghost"
            />
          )}
          {title && <h1 className="text-base sm:text-lg font-bold">{title}</h1>}
        </div>

        {/* Search and Filters Container */}
        <div className="space-y-3">
          {/* Row 1: Search + Add Button (stays on same row) */}
          <div className="flex items-end gap-3">
            {/* Search input - left */}
            <div className="w-full sm:w-auto sm:min-w-[370px] sm:max-w-[430px] flex-shrink-0">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-10 w-full placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-600 transition-all duration-200"
                  value={searchValue}
                  onChange={onSearchChange}
                />
              </div>
            </div>

            {/* Add Button - right, stays on same row */}
            <Button
              disabled
              variant="default"
              size="sm"
              title="Select an item to edit"
              className="flex-shrink-0 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          {/* Row 2+: Filters (wrap independently) */}
          <div className="flex flex-wrap gap-3 items-stretch">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
};
