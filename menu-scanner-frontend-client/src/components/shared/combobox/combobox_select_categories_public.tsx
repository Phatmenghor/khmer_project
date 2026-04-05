"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useAppDispatch } from "@/redux/store";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { fetchPublicCategories } from "@/redux/features/main/store/thunks/public-categories-thunks";
import { Package } from "lucide-react";

interface ComboboxSelectCategoriesPublicProps {
  selectedCategory: string;
  onChangeSelected: (categoryId: string) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
}

const ALL_OPTION: CategoriesResponseModel = {
  id: "",
  name: "All",
  description: "",
} as unknown as CategoriesResponseModel;

function ComboboxSelectCategoriesPublicComponent({
  selectedCategory,
  onChangeSelected,
  disabled = false,
  label = "Category",
  size = "md",
  placeholder = "All Categories",
}: ComboboxSelectCategoriesPublicProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<CategoriesResponseModel[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const commandListRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);
  const fetchingRef = useRef<Set<number>>(new Set());
  const pageRef = useRef(page);
  const dataLengthRef = useRef(data.length);
  const debouncedSearchRef = useRef(debouncedSearch);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    loadingRef.current = loading;
    lastPageRef.current = lastPage;
  }, [loading, lastPage]);

  useEffect(() => {
    pageRef.current = page;
    dataLengthRef.current = data.length;
    debouncedSearchRef.current = debouncedSearch;
    searchTermRef.current = searchTerm;
  }, [page, data.length, debouncedSearch, searchTerm]);

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10 text-base",
  };

  const removeDuplicates = (
    items: CategoriesResponseModel[],
  ): CategoriesResponseModel[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  };

  const fetchData = async (search: string, newPage: number) => {
    // Prevent duplicate requests for same page
    if (loadingRef.current || fetchingRef.current.has(newPage) || (lastPageRef.current && newPage > 1)) return;

    fetchingRef.current.add(newPage);
    setLoading(true);
    console.log("🔍 Fetching categories:", { search, newPage, pageSize: 15 });

    try {
      const result = await dispatch(
        fetchPublicCategories({
          search,
          pageNo: newPage,
          pageSize: 15,
          status: "ACTIVE",
        }),
      ).unwrap();

      console.log("✅ Categories result:", result);

      if (!result) {
        console.warn("⚠️ No result returned");
        return;
      }

      // Extract items and pagination from response
      const items = result.content || [];
      console.log("📦 Items extracted:", items);

      if (newPage === 1) {
        if (!search) {
          setData(removeDuplicates([ALL_OPTION, ...items]));
        } else {
          setData(removeDuplicates(items));
        }
      } else {
        setData((prev) => removeDuplicates([...prev, ...items]));
      }

      setPage(result.pageNo || newPage);
      setLastPage(result.last || false);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    } finally {
      setLoading(false);
      fetchingRef.current.delete(newPage);
    }
  };

  // Fetch data when dropdown opens or search term changes
  useEffect(() => {
    if (!open) return; // Don't fetch if dropdown is closed

    console.log("🔍 Fetching categories (open or search changed):", { debouncedSearch, searchTerm });

    setPage(1);
    setLastPage(false);
    setData([]);

    // Use debouncedSearch if available, otherwise use raw searchTerm
    const searchQuery = debouncedSearch !== undefined ? debouncedSearch : searchTerm;
    fetchData(searchQuery, 1);
  }, [debouncedSearch, open]);

  // Manual scroll detection - ONLY when dropdown is open
  useEffect(() => {
    if (!open || !commandListRef.current) return;

    const commandList = commandListRef.current;

    const handleScroll = () => {
      // Check if scrolled to bottom (within 100px)
      const isAtBottom =
        commandList.scrollHeight - commandList.scrollTop - commandList.clientHeight < 100;

      if (!isAtBottom) return;

      const nextPage = pageRef.current + 1;

      // Prevent duplicate requests
      if (loadingRef.current || lastPageRef.current || fetchingRef.current.has(nextPage) || dataLengthRef.current === 0) {
        return;
      }

      console.log("📜 Scrolled to bottom in dropdown, fetching next page:", nextPage);
      fetchData(debouncedSearchRef.current || searchTermRef.current, nextPage);
    };

    commandList.addEventListener("scroll", handleScroll);
    return () => commandList.removeEventListener("scroll", handleScroll);
  }, [open]);

  const handleSelect = (categoryId: string) => {
    onChangeSelected(categoryId);
    setOpen(false);
  };

  const selectedCategoryName = data.find(
    (c) => c.id === selectedCategory,
  )?.name;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10">
            <Package className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <Label className="text-xs font-medium text-foreground">{label}</Label>
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-w-[150px] px-3 py-2 transition-all duration-200 border-input",
              sizeClasses[size],
              !selectedCategory && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              open && "bg-primary/20 border-primary text-primary",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedCategoryName || placeholder}
            </span>
            <ChevronsUpDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 transition-all duration-200",
                !open && "opacity-50",
                open && "opacity-100 text-primary rotate-180",
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border-border"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search category..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList ref={commandListRef} className="max-h-60 overflow-y-auto">
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id || `all-${index}`}
                    value={item.name}
                    onSelect={() => handleSelect(item.id)}
                    className={cn(
                      sizeClasses[size],
                      "hover:bg-primary/10 hover:text-primary cursor-pointer",
                      (selectedCategory === item.id ||
                        (!selectedCategory && item.id === "")) &&
                        "bg-primary/20 text-primary font-medium",
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (selectedCategory === item.id ||
                          (!selectedCategory && item.id === ""))
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>

              {loading && (
                <div className="text-center py-2">
                  <Loader2 className="animate-spin text-primary h-5 w-5 mx-auto" />
                </div>
              )}

              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  No more categories
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const ComboboxSelectCategoriesPublic = memo(ComboboxSelectCategoriesPublicComponent);
