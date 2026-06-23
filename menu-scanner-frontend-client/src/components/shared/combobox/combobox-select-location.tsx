"use client";

import { useEffect, useState, useRef } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
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
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/utils/debounce/debounce";
import { useAppDispatch } from "@/store";
import { fetchAllLocationsService } from "@/features/location/store/thunks/location-thunks";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  fullAddress: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  streetNumber: string;
  houseNumber: string;
  note: string;
  latitude: number;
  longitude: number;
  [key: string]: unknown;
}

interface ComboboxSelectLocationProps {
  dataSelect: Location | null;
  onChangeSelected: (item: Location | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  hasDefault?: boolean;
}

export function ComboboxSelectLocation({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Delivery Address",
  required = false,
  placeholder = "Select address...",
  error,
  hasDefault = false,
}: ComboboxSelectLocationProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<Location[]>([]);
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

  const removeDuplicates = (items: Location[]): Location[] => {
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
        fetchAllLocationsService({
          search,
          pageNo: newPage,
          pageSize: 15,
        })
      ).unwrap();

      if (!result) return;

      if (newPage === 1) {
        const newData = result.content || [];
        setData(removeDuplicates(newData as unknown as Location[]));
      } else {
        setData((prev) => removeDuplicates([...prev, ...((result.content || []) as unknown as Location[])]));
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSelect = (item: Location) => {
    onChangeSelected(item);
    setOpen(false);
  };


  if (!hasDefault && data.length === 0 && !loading) {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <Label className="text-xs font-semibold">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <CustomButton
          onClick={() => router.push("/account/addresses")}
          variant="outline"
          className="w-full h-[32px] text-base md:text-sm gap-1"
        >
          <Plus className="h-2.5 w-2.5" />
          Add Address
        </CustomButton>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1 w-full">
      {label && (
        <Label className="text-xs font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <CustomButton
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between px-3 h-[32px] text-base md:text-sm transition-all duration-200 border-input",
              !dataSelect && "text-muted-foreground",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              "focus:bg-primary/10 focus:border-primary focus:text-primary focus:ring-2 focus:ring-primary/20",
              open && "bg-primary/20 border-primary text-primary",
              error && "border-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="truncate line-clamp-1">
              {dataSelect ? dataSelect.fullAddress : placeholder}
            </span>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </CustomButton>
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
              placeholder="Search address..."
              value={searchTerm}
              onValueChange={handleSearchChange}
              className="text-xs h-8 px-2 border-b"
            />
            <CommandList className="max-h-32 overflow-y-auto">
              <CommandEmpty className="text-xs py-1">
                <div className="flex flex-col items-center gap-1">
                  <span>No address found</span>
                  <CustomButton
                    onClick={() => {
                      setOpen(false);
                      router.push("/account/addresses");
                    }}
                    variant="outline"
                    size="sm"
                    className="h-5 text-xs gap-1"
                  >
                    <Plus className="h-2 w-2" />
                    Add Address
                  </CustomButton>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item.fullAddress}
                    onSelect={() => handleSelect(item)}
                    ref={index === data.length - 1 ? ref : null}
                    className="text-xs py-1"
                  >
                    <Check
                      className={cn(
                        "mr-1 h-3 w-3 flex-shrink-0",
                        dataSelect?.id === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate line-clamp-1 flex-1">{item.fullAddress}</span>
                    {item.note && (
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
                        ({item.note})
                      </span>
                    )}
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
                  No more addresses
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
