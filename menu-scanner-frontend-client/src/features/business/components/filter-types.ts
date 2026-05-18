
export interface FilterOption {
  value: string;
  label: string;
}

export interface BaseFilterConfig {
  id: string;
  type: FilterType;
  label: string;
  placeholder?: string;
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null | undefined) => void;
  disabled?: boolean;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: 'select';
  options: FilterOption[];
}

export interface ComboboxBrandFilterConfig extends Omit<BaseFilterConfig, 'value' | 'onChange'> {
  type: 'combobox-brand';
  value: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  showAllOption?: boolean;
}

export interface ComboboxCategoriesFilterConfig extends Omit<BaseFilterConfig, 'value' | 'onChange'> {
  type: 'combobox-categories';
  value: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  showAllOption?: boolean;
}

export interface InputNumberFilterConfig extends BaseFilterConfig {
  type: 'input-number';
  min?: number;
  max?: number;
}

export interface InputTextFilterConfig extends BaseFilterConfig {
  type: 'input-text';
}

export type FilterConfig =
  | SelectFilterConfig
  | ComboboxBrandFilterConfig
  | ComboboxCategoriesFilterConfig
  | InputNumberFilterConfig
  | InputTextFilterConfig;

/**
 * Filter Panel Configuration
 * Defines how filters are organized and displayed
 */
export interface FilterPanelConfig {
  title: string;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: FilterConfig[];
  buttonText?: string;
  buttonDisabled?: boolean;
  buttonTooltip?: string;
  onButtonClick?: () => void;
}
