# Dynamic Filter Component Design Guide

## Overview
This guide explains the recommended design pattern for creating reusable, dynamic filter components that work across all admin pages.

## Architecture

### 1. **Filter Types** (`filter-types.ts`)
Defines all supported filter types and configurations:
- `select` - Select dropdown
- `combobox-brand` - Brand selection with autocomplete
- `combobox-categories` - Category selection with autocomplete
- `input-number` - Number input for thresholds
- `input-text` - Text input for searches

### 2. **Dynamic Filter Panel** (`dynamic-filter-panel.tsx`)
A reusable component that:
- Renders filters based on configuration
- Handles all filter types dynamically
- Integrates with CardHeaderSection
- Maintains consistent styling across pages

### 3. **Filter Configuration**
Each page defines its filters as a config object:

```typescript
const filterConfig: FilterPanelConfig = {
  title: "Stock Items (Products & Sizes)",
  searchValue: filters.search,
  searchPlaceholder: "Search product name...",
  onSearchChange: handleSearchChange,
  filters: [
    {
      id: 'sortBy',
      type: 'select',
      label: 'Sort By',
      options: SORT_BY_OPTIONS,
      value: filters.sortBy,
      onChange: handleSortByChange,
    },
    {
      id: 'order',
      type: 'select',
      label: 'Order',
      options: SORT_DIRECTION_OPTIONS,
      value: filters.sortDirection,
      onChange: handleSortDirectionChange,
    },
    {
      id: 'brand',
      type: 'combobox-brand',
      label: 'Brand',
      value: selectedBrand,
      onChange: handleBrandChange,
      showAllOption: true,
    },
    {
      id: 'lowStockThreshold',
      type: 'input-number',
      label: 'Low Stock Threshold',
      value: filters.lowStockThreshold,
      onChange: handleLowStockThresholdChange,
      min: 0,
    },
    // ... more filters
  ],
  buttonText: 'Add',
  buttonDisabled: true,
  buttonTooltip: 'Select an item to edit',
};
```

## Implementation Approach

### Step 1: Define Filters Configuration
```typescript
// In your page component
const filterConfig: FilterPanelConfig = {
  // ... config as shown above
};
```

### Step 2: Use DynamicFilterPanel
```typescript
import { DynamicFilterPanel } from '@/redux/features/business/components/dynamic-filter-panel';

return (
  <div className="flex flex-1 flex-col gap-4 px-2">
    <div className="space-y-4">
      <DynamicFilterPanel config={filterConfig} />
      
      <DataTableWithPagination
        // ... table props
      />
    </div>
  </div>
);
```

## Benefits

✅ **Reusability** - Same component works across all pages
✅ **Maintainability** - Centralized filter rendering logic
✅ **Consistency** - All pages have identical styling and behavior
✅ **Scalability** - Add new filter types without changing page code
✅ **Type Safety** - Full TypeScript support for filter configurations
✅ **Flexibility** - Easy to add/remove/reorder filters

## Migration Path

### Current Stock Items Page
```typescript
// Before: Manually render each filter
<CardHeaderSection>
  <CustomSelect ... />
  <CustomSelect ... />
  <ComboboxSelectBrand ... />
  {/* etc */}
</CardHeaderSection>

// After: Use configuration-driven approach
<DynamicFilterPanel config={filterConfig} />
```

### Apply to Products Page
The same DynamicFilterPanel can be used with different filter configurations:

```typescript
// products/page.tsx
const productFilterConfig: FilterPanelConfig = {
  title: "Products",
  searchValue: filters.search,
  searchPlaceholder: "Search product name...",
  onSearchChange: handleSearchChange,
  filters: [
    {
      id: 'sortBy',
      type: 'select',
      label: 'Sort By',
      options: PRODUCT_SORT_OPTIONS,
      value: filters.sortBy,
      onChange: handleSortByChange,
    },
    {
      id: 'category',
      type: 'combobox-categories',
      label: 'Category',
      value: selectedCategory,
      onChange: handleCategoryChange,
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      options: STATUS_OPTIONS,
      value: filters.status,
      onChange: handleStatusChange,
    },
    // ... more filters specific to products
  ],
  buttonText: 'Add Product',
};

return <DynamicFilterPanel config={productFilterConfig} />;
```

## Advanced Usage

### Adding Custom Filter Types
To add a new filter type (e.g., date range):

1. Update `FilterType` in `filter-types.ts`:
```typescript
export type FilterType = 'select' | 'combobox-brand' | ... | 'date-range';
```

2. Create interface:
```typescript
export interface DateRangeFilterConfig extends BaseFilterConfig {
  type: 'date-range';
}
```

3. Add rendering case in `dynamic-filter-panel.tsx`:
```typescript
case 'date-range':
  return (
    <DateRangePicker
      value={filter.value}
      onChange={filter.onChange}
      label={filter.label}
    />
  );
```

### Conditional Filters
Show/hide filters based on conditions:

```typescript
filters: [
  // Always show
  { id: 'sortBy', ... },
  
  // Only show if user has permission
  ...(user.canFilterByPrice ? [{ id: 'price', ... }] : []),
  
  // Only show if advanced mode enabled
  ...(advancedMode ? [{ id: 'advancedFilter', ... }] : []),
]
```

## Styling & Responsive Design

The component automatically:
- Wraps filters responsively on smaller screens
- Keeps search left, button right
- Maintains consistent spacing and styling
- Works with CardHeaderSection's built-in responsive layout

## Performance Considerations

✅ Filters render as children (efficient)
✅ Config is memoized to prevent unnecessary re-renders
✅ onChange handlers are callback-based (can be memoized with useCallback)
✅ No unnecessary prop spreading

## Testing Strategy

Test the DynamicFilterPanel with:
1. Different filter type combinations
2. Search + filter interactions
3. Filter value changes triggering data fetches
4. Button states (enabled/disabled)
5. Responsive breakpoints

## File Structure
```
src/redux/features/business/
├── components/
│   ├── dynamic-filter-panel.tsx      (reusable component)
│   ├── filter-types.ts               (type definitions)
│   └── stock-items-filter-panel.tsx  (deprecated - can be removed)
├── hooks/
│   └── use-dynamic-filters.ts        (optional hook for advanced usage)
└── ...
```

## Summary
By following this design pattern:
- All admin pages use the same filter component
- Filter logic is centralized and consistent
- Adding new pages/filters is straightforward
- Code is more maintainable and testable
