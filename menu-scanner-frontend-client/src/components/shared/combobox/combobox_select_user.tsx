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
import { UserResponseModel } from "@/redux/features/auth/store/models/response/users-response";
import { fetchAllUsersService } from "@/redux/features/auth/store/thunks/users-thunks";

interface ComboboxSelectUserProps {
  dataSelect: UserResponseModel | null;
  onChangeSelected: (item: UserResponseModel | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  error?: string;
}

export function ComboboxSelectUser({
  dataSelect,
  onChangeSelected,
  disabled = false,
  label = "User",
  required = false,
  size = "md",
  placeholder = "Select a user...",
  error,
}: ComboboxSelectUserProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<UserResponseModel[]>([]);
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

  // Helper function to remove duplicates by ID
  const removeDuplicates = (
    items: UserResponseModel[]
  ): UserResponseModel[] => {
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
        fetchAllUsersService({
          search,
          pageNo: newPage,
          pageSize: 15,
        })
      ).unwrap();

      if (!result) return;

      if (newPage === 1) {
        const newData = result.content;
        setData(removeDuplicates(newData));
      } else {
        // Merge with existing data and remove duplicates
        setData((prev) => removeDuplicates([...prev, ...result.content]));
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const handleSelect = (item: UserResponseModel) => {
    onChangeSelected(item);
    setOpen(false);
  };

  return (
    <div className="space-y-2 w-full">
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
              "w-full justify-between min-w-[150px]",
              sizeClasses[size],
              !dataSelect && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
            disabled={disabled}
          >
            {dataSelect ? dataSelect.fullName : placeholder}
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
              placeholder="Search user..."
              value={searchTerm}
              onValueChange={handleSearchChange}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    value={item.fullName}
                    onSelect={() => handleSelect(item)}
                    ref={index === data.length - 1 ? ref : null}
                    className={sizeClasses[size]}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        dataSelect?.id === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>
                      {item.fullName}
                      {item.roles && item.roles.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({item.roles.join(", ")})
                        </span>
                      )}
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
                  No more users
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
