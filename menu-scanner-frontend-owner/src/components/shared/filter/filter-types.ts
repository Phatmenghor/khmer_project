import { BusinessOption } from "@/components/shared/combo-box/combobox-business";

export interface FilterOption {
  value: string | undefined;
  label: string;
}

interface BaseFilterConfig {
  id: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: "select";
  options: FilterOption[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export interface ComboboxBusinessFilterConfig extends BaseFilterConfig {
  type: "combobox-business";
  value: BusinessOption | null;
  onChange: (value: BusinessOption | null) => void;
  showAllOption?: boolean;
}

export interface DatePickerFilterConfig extends BaseFilterConfig {
  type: "date-picker";
  value: string;
  onChange: (value: string) => void;
}

export type FilterConfig =
  | SelectFilterConfig
  | ComboboxBusinessFilterConfig
  | DatePickerFilterConfig;

export interface FilterPanelConfig {
  title: string;
  subtitle?: string;
  totalCount?: number;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: FilterConfig[];
  buttonText?: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  onClearAll?: () => void;
  extraActions?: React.ReactNode;
}
