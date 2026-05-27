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
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ProvinceResponseModel } from "@/redux/features/location/store/models/response/province-response";
import { fetchAllProvinceService } from "@/redux/features/location/store/thunks/province-thunks";
import { useAppDispatch } from "@/redux/store";

interface ComboboxSelectedProps {
  dataSelect: ProvinceResponseModel | null;
  onChangeSelected: (item: ProvinceResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  showAllOption?: boolean;
}

const ALL_OPTION: ProvinceResponseModel = {
  id: "all",
  provinceEn: "All",
  provinceKh: "ទាំងអស់",
  provinceCode: "",
} as ProvinceResponseModel;

export function ComboboxSelectProvince({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Province",
  required = false,
  size = "md",
  placeholder = "Select a province...",
  showAllOption = true,
}: ComboboxSelectedProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<ProvinceResponseModel[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);
  const pageRef = useRef(1);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    lastPageRef.current = lastPage;
  }, [lastPage]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10 text-base",
  };

  const fetchData = async (search: string, newPage: number) => {
    if (loadingRef.current || (lastPageRef.current && newPage > 1)) return;

    setLoading(true);

    try {
      const result = await dispatch(
        fetchAllProvinceService({ search, pageNo: newPage, pageSize: 10 })
      ).unwrap();

      if (!result) return;

      if (newPage === 1) {
        const newData = result.content;
        if (showAllOption && !search) {
          setData([ALL_OPTION, ...newData]);
        } else {
          setData(newData);
        }
      } else {
        setData((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          return [...prev, ...result.content.filter((i) => !existingIds.has(i.id))];
        });
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setLastPage(false);
    setData([]);
    fetchData(debouncedSearch, 1);
  }, [debouncedSearch]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isNearBottom && !loadingRef.current && !lastPageRef.current && data.length > 0) {
      fetchData(debouncedSearch, pageRef.current + 1);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSelect = (item: ProvinceResponseModel) => {
    if (item.id === "all") {
      onChangeSelected(null);
    } else {
      onChangeSelected(item);
    }
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <Label className="text-xs sm:text-sm font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between gap-2 min-w-[150px] transition-all duration-200",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              open && "bg-primary/20 border-primary text-primary",
              sizeClasses[size],
              !dataSelect && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="flex-1 truncate min-w-0 text-left">
              {dataSelect ? (dataSelect.provinceEn || dataSelect.provinceKh) : placeholder}
            </span>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 transition-all duration-200",
                open ? "rotate-180 opacity-100 text-primary" : "opacity-50"
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Search province..."
              value={searchTerm}
              onValueChange={handleSearchChange}
            />
            <CommandList
              className="max-h-60 overflow-y-auto"
              onScroll={handleScroll}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <CommandEmpty>No province found.</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.provinceEn || item.provinceKh}
                    onSelect={() => handleSelect(item)}
                    className={sizeClasses[size]}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (item.id === "all" && !dataSelect) ||
                          dataSelect?.id === item.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {item.provinceEn || item.provinceKh}
                  </CommandItem>
                ))}
              </CommandGroup>

              {loading && (
                <div className="text-center py-2">
                  <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
                </div>
              )}

              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-2 text-sm text-gray-400">
                  No more provinces
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
