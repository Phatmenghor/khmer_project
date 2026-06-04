"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
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

  useEffect(() => {
    latestCommittedRef.current = value;
    if (!isTypingRef.current) {
      setInputText(String(value));
    }
  }, [value]);

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
    [min, max, onChange], // eslint-disable-line react-hooks/exhaustive-deps
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
    if (raw === "") {
      setInputText("");
      isTypingRef.current = true;
      return;
    }
    if (!/^\d{1,3}$/.test(raw)) return;
    setInputText(raw);
    isTypingRef.current = true;
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
  const canDecrement = displayValue > min;

  return (
    <div className={cn("flex items-center", className)}>
      {/* Decrement button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={cn(
          "flex items-center justify-center rounded-l-xl border border-r-0 transition-all duration-150",
          isSmall ? "h-6 w-6" : "h-7 w-7",
          canDecrement
            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/80 active:scale-95"
            : "bg-muted text-muted-foreground/40 border-border cursor-not-allowed",
        )}
      >
        <Minus className={cn(isSmall ? "h-2 w-2" : "h-3 w-3")} />
      </button>

      {/* Input */}
      <input
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={inputText}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "text-center font-bold border-y focus:outline-none focus:ring-0 border-x-0",
          pending
            ? "bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
            : "bg-background text-primary border-primary/30",
          isSmall ? "w-8 h-6 text-xs" : "w-10 h-7 text-xs",
        )}
      />

      {/* Increment button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={displayValue >= max}
        className={cn(
          "flex items-center justify-center rounded-r-xl border border-l-0 transition-all duration-150",
          isSmall ? "h-6 w-6" : "h-7 w-7",
          displayValue < max
            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/80 active:scale-95"
            : "bg-muted text-muted-foreground/40 border-border cursor-not-allowed",
        )}
      >
        <Plus className={cn(isSmall ? "h-2 w-2" : "h-3 w-3")} />
      </button>
    </div>
  );
}
