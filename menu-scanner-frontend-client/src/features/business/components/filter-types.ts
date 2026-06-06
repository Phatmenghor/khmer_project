
export type FilterType = 'select' | 'combobox-brand' | 'combobox-categories' | 'input-number' | 'input-text' | 'date';

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

export interface DateFilterConfig extends BaseFilterConfig {
  type: 'date';
}

export type FilterConfig =
  | SelectFilterConfig
  | ComboboxBrandFilterConfig
  | ComboboxCategoriesFilterConfig
  | InputNumberFilterConfig
  | InputTextFilterConfig
  | DateFilterConfig;


export interface FilterPanelConfig {
  title: string;
  /** Optional total-count chip rendered next to the title (e.g., 248 products). */
  totalCount?: number;
  /** Optional sentence rendered below the title. */
  subtitle?: string;
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: FilterConfig[];
  /** Primary action button (right of the title row). */
  buttonText?: string;
  buttonDisabled?: boolean;
  buttonTooltip?: string;
  onButtonClick?: () => void;
  /** Extra action buttons rendered before the primary button. */
  extraActions?: React.ReactNode;
  /** Called when the user clicks "Clear all" — invoked only when at least one filter is active. */
  onClearAll?: () => void;
}
