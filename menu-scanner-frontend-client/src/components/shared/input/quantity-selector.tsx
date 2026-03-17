"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  /** pending = qty changed but not yet saved to cart (amber); default = primary */
  pending?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max = 999,
  size = "md",
  className,
  pending = false,
}: QuantitySelectorProps) {
  const [inputText, setInputText] = useState(String(value));
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const latestCommittedRef = useRef(value);
  const isTypingRef = useRef(false);

  // Sync with external value only when not actively typing
  useEffect(() => {
    latestCommittedRef.current = value;
    if (!isTypingRef.current) {
      setInputText(String(value));
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const clamp = (v: number) => Math.min(Math.max(v, min), max);

  const commitValue = useCallback(
    (newValue: number) => {
      const clamped = clamp(newValue);
      latestCommittedRef.current = clamped;
      setInputText(String(clamped));
      isTypingRef.current = false;
      onChange(clamped);
    },
    [min, max, onChange],
  );

  const handleDecrement = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    isTypingRef.current = false;
    const current = latestCommittedRef.current;
    if (current <= min) return;
    commitValue(current - 1);
  };

  const handleIncrement = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    isTypingRef.current = false;
    const current = latestCommittedRef.current;
    if (current >= max) return;
    commitValue(current + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow clearing the field
    if (raw === "") {
      setInputText("");
      isTypingRef.current = true;
      return;
    }

    // Only allow digits, max 3 characters
    if (!/^\d{1,3}$/.test(raw)) return;

    setInputText(raw);
    isTypingRef.current = true;

    // Debounce commit for typed input
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      commitValue(parseInt(raw, 10));
    }, 600);
  };

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const parsed = parseInt(inputText, 10);
    commitValue(isNaN(parsed) ? min : parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const isSmall = size === "sm";
  const displayValue = latestCommittedRef.current;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CustomButton
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        className={cn(
          isSmall ? "h-8 w-8" : "h-10 w-10",
          displayValue <= min && "opacity-40",
        )}
      >
        <Minus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </CustomButton>

      <input
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={inputText}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "text-center font-bold rounded border focus:outline-none focus:ring-2",
          pending
            ? "bg-amber-50 text-amber-600 border-amber-200 focus:ring-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
            : "bg-primary/10 text-primary border-primary/20 focus:ring-primary/30",
          isSmall ? "w-12 h-8 text-sm" : "w-16 h-10 text-lg",
        )}
      />

      <CustomButton
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        className={cn(isSmall ? "h-8 w-8" : "h-10 w-10")}
      >
        <Plus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </CustomButton>
    </div>
  );
}
