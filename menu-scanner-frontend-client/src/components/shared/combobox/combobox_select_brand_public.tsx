"use client";

import { useEffect, useState, useRef } from "react";
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
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/utils/debounce/debounce";
import { useAppDispatch } from "@/redux/store";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { fetchAllBrandService } from "@/redux/features/master-data/store/thunks/brand-thunks";

interface ComboboxSelectBrandPublicProps {
  selectedBrand: string;
  onChangeSelected: (brandId: string) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
}

const ALL_OPTION: BrandResponseModel = {
  id: "",
  name: "All",
  description: "",
} as unknown as BrandResponseModel;

export function ComboboxSelectBrandPublic({
  selectedBrand,
  onChangeSelected,
  disabled = false,
  label = "Brand",
  size = "md",
  placeholder = "All Brands",
}: ComboboxSelectBrandPublicProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<BrandResponseModel[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView({ threshold: 0.5 });
  const debouncedSearch = useDebounce(searchTerm, 400);

  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
    lastPageRef.current = lastPage;
  }, [loading, lastPage]);

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10 text-base",
  };

  const removeDuplicates = (
    items: BrandResponseModel[],
  ): BrandResponseModel[] => {
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
    if (loadingRef.current || (lastPageRef.current && newPage > 1)) return;

    setLoading(true);

    try {
      const result = await dispatch(
        fetchAllBrandService({
          search,
          pageNo: newPage,
          pageSize: 15,
          status: "ACTIVE",
        }),
      ).unwrap();

      if (!result) return;

      if (newPage === 1) {
        const newData = result.content;
        if (!search) {
          setData(removeDuplicates([ALL_OPTION, ...newData]));
        } else {
          setData(removeDuplicates(newData));
        }
      } else {
        setData((prev) => removeDuplicates([...prev, ...result.content]));
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setLastPage(false);
    setData([]);
    fetchData(debouncedSearch, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (
      inView &&
      !loadingRef.current &&
      !lastPageRef.current &&
      data.length > 0
    ) {
      fetchData(debouncedSearch, page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, page, data.length]);

  const handleSelect = (brandId: string) => {
    onChangeSelected(brandId);
    setOpen(false);
  };

  const selectedBrandName = data.find((b) => b.id === selectedBrand)?.name;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <Label className="text-xs font-medium text-foreground">{label}</Label>
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
              !selectedBrand && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/30",
              open && "bg-primary/20 border-primary text-primary",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedBrandName || placeholder}
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
              placeholder="Search brand..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>No brand found.</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id || `all-${index}`}
                    value={item.name}
                    onSelect={() => handleSelect(item.id)}
                    ref={index === data.length - 1 ? ref : null}
                    className={cn(
                      sizeClasses[size],
                      "hover:bg-primary/10 hover:text-primary cursor-pointer",
                      (selectedBrand === item.id ||
                        (!selectedBrand && item.id === "")) &&
                        "bg-primary/20 text-primary font-medium",
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (selectedBrand === item.id ||
                          (!selectedBrand && item.id === ""))
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
                  No more brands
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
