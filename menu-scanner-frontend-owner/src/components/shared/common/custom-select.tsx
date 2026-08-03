import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface SelectOption {
  value: string | undefined;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string; // Add label prop
  required?: boolean; // Optional required indicator
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  placeholder = "Select option",
  onValueChange,
  className = "",
  disabled = false,
  size = "md",
  label = "Select option",
  required = false,
}) => {
  const sizeClasses = {
    sm: "h-8 text-xs rounded-[10px]",
    md: "h-[36px] text-base md:text-sm rounded-[12px]",
    lg: "h-10 text-base md:text-sm rounded-[12px]",
  };

  return (
    <div className="space-y-1 w-full">
      {label && (
        <Label className="text-xs sm:text-xs font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={`min-w-[150px] ${sizeClasses[size]} ${className}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, idx) => (
            <SelectItem
              key={option.value ?? `option-${idx}`}
              value={option.value == undefined ? "All" : option.value}
              disabled={option.disabled}
              className={sizeClasses[size]}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
