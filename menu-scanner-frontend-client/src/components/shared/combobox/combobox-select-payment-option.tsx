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
import { fetchAllPaymentOptionsService } from "@/redux/features/master-data/store/thunks/payment-options-thunks";

interface PaymentOption {
  id: string;
  name: string;
  paymentOptionType: string;
  [key: string]: any;
}

interface ComboboxSelectPaymentProps {
  dataSelect: PaymentOption | null;
  onChangeSelected: (item: PaymentOption | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectPayment({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "Payment Method",
  required = false,
  placeholder = "Select payment method...",
  error,
}: ComboboxSelectPaymentProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<PaymentOption[]>([]);
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

  const removeDuplicates = (items: PaymentOption[]): PaymentOption[] => {
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
        fetchAllPaymentOptionsService({
          search,
          pageNo: newPage,
          pageSize: 20,
        })
      ).unwrap();

      if (!result) return;

      if (newPage === 1) {
        const newData = result.content;
        setData(removeDuplicates(newData));
      } else {
        setData((prev) => removeDuplicates([...prev, ...result.content]));
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching payment options:", error);
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

  const handleSelect = (item: PaymentOption) => {
    onChangeSelected(item);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label className="text-xs font-semibold">
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
              "w-full justify-between px-4 py-2 h-11 text-sm",
              !dataSelect && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
            disabled={disabled}
          >
            <span className="truncate line-clamp-1">
              {dataSelect ? dataSelect.name : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search payment method..."
              value={searchTerm}
              onValueChange={handleSearchChange}
              className="text-sm h-11 px-3 border-b"
            />
            <CommandList className="max-h-48 overflow-y-auto">
              <CommandEmpty className="text-xs">No method found.</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleSelect(item)}
                    ref={index === data.length - 1 ? ref : null}
                    className="text-sm py-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        dataSelect?.id === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate line-clamp-1 flex-1">{item.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      ({item.paymentOptionType})
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {loading && (
                <div className="text-center py-2">
                  <Loader2 className="animate-spin text-gray-500 h-4 w-4 mx-auto" />
                </div>
              )}
              {!loading && lastPage && data.length > 0 && (
                <div className="text-center py-1 text-xs text-gray-400">
                  No more methods
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
