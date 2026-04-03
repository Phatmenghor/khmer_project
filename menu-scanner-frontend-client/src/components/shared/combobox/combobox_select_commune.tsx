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
import { CommuneResponseModel } from "@/redux/features/location/store/models/response/location-response";
import { fetchCommunesService } from "@/redux/features/location/store/thunks/public-location-thunks";

interface ComboboxSelectCommuneProps {
  dataSelect: CommuneResponseModel | null;
  onChangeSelected: (item: CommuneResponseModel | null) => void;
  districtCode?: string | null;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectCommune({
  dataSelect,
  onChangeSelected,
  districtCode,
  disabled = false,
  label = "Commune / Sangkat",
  required = false,
  placeholder,
  error,
}: ComboboxSelectCommuneProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<CommuneResponseModel[]>([]);
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
    items: CommuneResponseModel[]
  ): CommuneResponseModel[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const fetchData = async (search: string, newPage: number) => {
    if (!districtCode) return;
    if (loadingRef.current || (lastPageRef.current && newPage > 1)) return;

    setLoading(true);
    try {
      const result = await dispatch(
        fetchCommunesService({
          search,
          pageNo: newPage,
          pageSize: 15,
          districtCode,
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
      console.error("Error fetching communes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset and refetch when districtCode or debouncedSearch changes
  useEffect(() => {
    setPage(1);
    setLastPage(false);
    setData([]);
    if (districtCode) {
      fetchData(debouncedSearch, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, districtCode]);

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

  const handleSelect = (item: CommuneResponseModel) => {
    onChangeSelected(item);
    setOpen(false);
  };

  const resolvedPlaceholder =
    placeholder ??
    (!districtCode ? "Select district first" : "Select commune...");

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label className="text-sm font-medium">
          {label}
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
              (disabled || !districtCode) && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
            disabled={disabled || !districtCode}
          >
            {dataSelect ? dataSelect.communeEn : resolvedPlaceholder}
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
              placeholder="Search commune..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>No commune found.</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item.communeCode}
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
                    {item.communeEn}
                    <span className="ml-2 text-muted-foreground text-xs">
                      {item.communeKh}
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
                  No more communes
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
