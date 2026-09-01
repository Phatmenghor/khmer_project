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
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useAppDispatch } from "@/store";
import { fetchAllBusinessService } from "@/features/subscription/store/thunks/business-thunks";

export interface BusinessOption {
  id: string;
  name: string;
}

interface ComboboxBusinessProps {
  value: BusinessOption | null;
  onChange: (item: BusinessOption | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  showAllOption?: boolean;
}

const ALL_OPTION: BusinessOption = { id: "all", name: "All Businesses" };

export function ComboboxBusiness({
  value,
  onChange,
  disabled = false,
  label = "Business",
  required = false,
  size = "md",
  placeholder = "Select business...",
  showAllOption = true,
}: ComboboxBusinessProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<BusinessOption[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);
  const pageRef = useRef(1);

  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { lastPageRef.current = lastPage; }, [lastPage]);
  useEffect(() => { pageRef.current = page; }, [page]);

  const sizeClasses = { sm: "h-5 text-xs", md: "h-6 text-xs", lg: "h-7 text-xs" };

  const fetchData = async (search: string, newPage: number) => {
    if (loadingRef.current || (lastPageRef.current && newPage > 1)) return;
    setLoading(true);
    try {
      const result = await dispatch(
        fetchAllBusinessService({ search, pageNo: newPage, pageSize: 10 })
      ).unwrap();
      if (!result) return;

      const mapped: BusinessOption[] = result.content.map((b: any) => ({
        id: b.id,
        name: b.name,
      }));

      if (newPage === 1) {
        setData(showAllOption && !search ? [ALL_OPTION, ...mapped] : mapped);
      } else {
        setData((prev) => {
          const ids = new Set(prev.map((i) => i.id));
          return [...prev, ...mapped.filter((i) => !ids.has(i.id))];
        });
      }
      setPage(result.pageNo);
      setLastPage(result.last);
    } catch {
      // silent
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
    const t = e.currentTarget;
    if (t.scrollHeight - t.scrollTop <= t.clientHeight + 50 && !loadingRef.current && !lastPageRef.current && data.length > 0) {
      fetchData(debouncedSearch, pageRef.current + 1);
    }
  };

  const handleSelect = (item: BusinessOption) => {
    onChange(item.id === "all" ? null : item);
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
              "w-full justify-between gap-1 min-w-[160px] transition-all duration-200",
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
              open && "bg-primary/20 border-primary text-primary",
              sizeClasses[size],
              !value && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="flex-1 truncate min-w-0 text-left">
              {value ? value.name : placeholder}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {Boolean(value) && value?.id !== "ALL" && value?.id !== "all" && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  title="Clear selection"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onChange(null as any);
                  }}
                  className="p-0.5 rounded-full hover:bg-destructive/15 hover:text-destructive text-muted-foreground/70 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronDown className={cn("h-3 w-3 shrink-0 transition-all duration-200", open ? "rotate-180 opacity-100 text-primary" : "opacity-50")} />
            </div>
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
              placeholder="Search business..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList
              className="max-h-44 overflow-y-auto"
              onScroll={handleScroll}
              onWheel={(e) => e.stopPropagation()}
            >
              <CommandEmpty>No business found.</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleSelect(item)}
                    className="min-h-fit py-1 px-1 whitespace-normal"
                  >
                    <Check className={cn("mr-1 h-3 w-3 shrink-0", (item.id === "all" && !value) || value?.id === item.id ? "opacity-100" : "opacity-0")} />
                    <span className="break-words">{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {loading && (
                <div className="text-center py-1">
                  <Loader2 className="animate-spin text-gray-500 h-3 w-3 mx-auto" />
                </div>
              )}
              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-1 text-xs text-gray-400">No more businesses</div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
