/**
 * Filter Configuration Types
 * Define all filter types and configurations for dynamic filter panels
 */

export type FilterType = 'select' | 'combobox-brand' | 'combobox-categories' | 'input-number' | 'input-text';

export interface FilterOption {
  value: string;
  label: string;
}

export interface BaseFilterConfig {
  id: string;
  type: FilterType;
  label: string;
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: 'select';
  options: FilterOption[];
}

export interface ComboboxBrandFilterConfig extends BaseFilterConfig {
  type: 'combobox-brand';
  showAllOption?: boolean;
}

export interface ComboboxCategoriesFilterConfig extends BaseFilterConfig {
  type: 'combobox-categories';
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
