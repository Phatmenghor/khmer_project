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
import { useAppDispatch } from "@/redux/store";
import { VillageResponseModel } from "@/redux/features/location/store/models/response/village-response";
import { fetchAllVillageService } from "@/redux/features/location/store/thunks/village-thunks";

interface ComboboxSelectedProps {
  dataSelect: VillageResponseModel | null;
  onChangeSelected: (item: VillageResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  showAllOption?: boolean;
}

const ALL_OPTION: VillageResponseModel = {
  id: "all",
  villageEn: "All",
  villageKh: "ទាំងអស់",
  villageCode: "",
} as VillageResponseModel;

export function ComboboxSelectVillage({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Village",
  required = false,
  size = "md",
  placeholder = "Select a village...",
  showAllOption = true,
}: ComboboxSelectedProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<VillageResponseModel[]>([]);
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
    sm: "h-5 text-xs",
    md: "h-6 text-xs",
    lg: "h-7 text-xs",
  };

  const fetchData = async (search: string, newPage: number) => {
    if (loadingRef.current || (lastPageRef.current && newPage > 1)) return;

    setLoading(true);

    try {
      const result = await dispatch(
        fetchAllVillageService({ search, pageNo: newPage, pageSize: 10 })
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
          return [...prev, ...result.content.filter((i: VillageResponseModel) => !existingIds.has(i.id))];
        });
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching villages:", error);
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

  const handleSelect = (item: VillageResponseModel) => {
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
        <Label className="text-xs sm:text-xs font-semibold text-foreground">
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
              "w-full justify-between gap-1 min-w-[150px] transition-all duration-200",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              open && "bg-primary/20 border-primary text-primary",
              sizeClasses[size],
              !dataSelect && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="flex-1 truncate min-w-0 text-left">
              {dataSelect ? (dataSelect.villageEn || dataSelect.villageKh) : placeholder}
            </span>
            <ChevronDown
              className={cn(
                "ml-1 h-3 w-3 shrink-0 transition-all duration-200",
                open ? "rotate-180 opacity-100 text-primary" : "opacity-50"
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="min-w-[var(--radix-popover-trigger-width)] w-auto max-w-[90vw] sm:max-w-xs md:max-w-sm p-1 rounded-[12px] shadow-lg border-border bg-popover z-50 pointer-events-auto"
          align="start"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput
              placeholder="Search village..."
              value={searchTerm}
              onValueChange={handleSearchChange}
            />
            <CommandList
              className="max-h-44 overflow-y-auto"
              onScroll={handleScroll}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <CommandEmpty>No village found.</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.villageEn || item.villageKh}
                    onSelect={() => handleSelect(item)}
                    className="min-h-fit py-1 px-1 whitespace-normal"
                  >
                    <Check
                      className={cn(
                        "mr-1 h-3 w-3 shrink-0",
                        (item.id === "all" && !dataSelect) ||
                          dataSelect?.id === item.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="break-words">{item.villageEn || item.villageKh}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              {loading && (
                <div className="text-center py-1">
                  <Loader2 className="animate-spin text-gray-500 h-3 w-3 mx-auto" />
                </div>
              )}

              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-1 text-xs text-gray-400">
                  No more villages
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
