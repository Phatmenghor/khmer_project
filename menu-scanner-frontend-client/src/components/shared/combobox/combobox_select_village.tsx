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
import { VillageResponseModel } from "@/redux/features/location/store/models/response/location-response";
import { fetchVillagesService } from "@/redux/features/location/store/thunks/public-location-thunks";

interface ComboboxSelectVillageProps {
  dataSelect: VillageResponseModel | null;
  onChangeSelected: (item: VillageResponseModel | null) => void;
  communeCode?: string | null;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectVillage({
  dataSelect,
  onChangeSelected,
  communeCode,
  disabled = false,
  label = "Village / Phum",
  required = false,
  placeholder,
  error,
}: ComboboxSelectVillageProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<VillageResponseModel[]>([]);
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

  const removeDuplicates = (
    items: VillageResponseModel[]
  ): VillageResponseModel[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const fetchData = async (search: string, newPage: number) => {
    if (!communeCode) return;
    if (loadingRef.current || (lastPageRef.current && newPage > 1)) return;

    setLoading(true);
    try {
      const result = await dispatch(
        fetchVillagesService({
          search,
          pageNo: newPage,
          pageSize: 15,
          communeCode,
        })
      ).unwrap();

      if (!result) return;

      if (newPage === 1) {
        setData(removeDuplicates(result.content));
      } else {
        setData((prev) => removeDuplicates([...prev, ...result.content]));
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (err) {
      console.error("Error fetching villages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset and refetch when communeCode or debouncedSearch changes
  useEffect(() => {
    setPage(1);
    setLastPage(false);
    setData([]);
    if (communeCode) {
      fetchData(debouncedSearch, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, communeCode]);

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

  const handleSelect = (item: VillageResponseModel) => {
    onChangeSelected(item);
    setOpen(false);
  };

  const resolvedPlaceholder =
    placeholder ??
    (!communeCode ? "Select commune first" : "Select village...");

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          <span className="text-muted-foreground text-xs font-normal ml-1">
            (optional)
          </span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-9 text-sm",
              !dataSelect && "text-muted-foreground",
              (disabled || !communeCode) && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
            disabled={disabled || !communeCode}
          >
            {dataSelect ? dataSelect.villageEn : resolvedPlaceholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
              placeholder="Search village..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>No village found.</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item.villageCode}
                    onSelect={() => handleSelect(item)}
                    ref={index === data.length - 1 ? ref : null}
                    className="h-9 text-sm"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        dataSelect?.id === item.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {item.villageEn}
                    <span className="ml-2 text-muted-foreground text-xs">
                      {item.villageKh}
                    </span>
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
                  No more villages
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
