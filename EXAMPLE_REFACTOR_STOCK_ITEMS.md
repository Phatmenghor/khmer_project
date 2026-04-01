# Example: Refactor Stock Items Page with DynamicFilterPanel

## Current Implementation (Before)
The stock items page currently manually renders each filter component.

## Refactored Implementation (After)

### Step 1: Define Filter Configuration

```typescript
// In page.tsx, create filterConfig object
const filterConfig: FilterPanelConfig = {
  title: "Stock Items (Products & Sizes)",
  searchValue: filters.search,
  searchPlaceholder: "Search product name...",
  onSearchChange: handleSearchChange,
  
  filters: [
    // Sort Options
    {
      id: 'sortBy',
      type: 'select',
      label: 'Sort By',
      options: SORT_BY_OPTIONS,
      value: filters.sortBy,
      onChange: handleSortByChange,
    },
    {
      id: 'sortDirection',
      type: 'select',
      label: 'Order',
      options: SORT_DIRECTION_OPTIONS,
      value: filters.sortDirection,
      onChange: handleSortDirectionChange,
    },
    
    // Filters
    {
      id: 'brand',
      type: 'combobox-brand',
      label: 'Brand',
      placeholder: 'All Brand',
      value: selectedBrand,
      onChange: handleBrandChange,
      showAllOption: true,
    },
    {
      id: 'category',
      type: 'combobox-categories',
      label: 'Category',
      placeholder: 'All Categories',
      value: selectedCategories,
      onChange: handleCategoriesChange,
      showAllOption: true,
    },
    {
      id: 'stockStatus',
      type: 'select',
      label: 'Stock Status',
      options: STOCK_STATUS_FILTER,
      value: stockStatusFilterUI,
      onChange: handleStockStatusChange,
    },
    {
      id: 'productStatus',
      type: 'select',
      label: 'Product Status',
      options: PRODUCT_STATUS_FILTER,
      value: filters.status || 'ALL',
      onChange: handleProductStatusChange,
    },
    {
      id: 'productType',
      type: 'select',
      label: 'Product Type',
      options: HAS_SIZES_FILTER,
      value: hasSizesFilterUI,
      onChange: handleHasSizesChange,
    },
    {
      id: 'lowStockThreshold',
      type: 'input-number',
      label: 'Low Stock Threshold',
      placeholder: '0',
      value: filters.lowStockThreshold,
      onChange: handleLowStockThresholdChange,
      min: 0,
    },
  ],
  
  // Button Configuration
  buttonText: 'Add',
  buttonDisabled: true,
  buttonTooltip: 'Select an item to edit',
};
```

### Step 2: Replace CardHeaderSection with DynamicFilterPanel

**Before:**
```typescript
<CardHeaderSection
  title="Stock Items (Products & Sizes)"
  searchValue={filters.search}
  searchPlaceholder="Search product name..."
  onSearchChange={handleSearchChange}
  buttonText="Add"
  buttonIcon={<Plus className="w-3 h-3" />}
  buttonTooltip="Select an item to edit"
  customAddNewButton={
    <Button disabled size="sm" variant="default" className="gap-2">
      <Plus className="w-4 h-4" />
      Add
    </Button>
  }
>
  {/* Manually render each filter */}
  <CustomSelect
    options={SORT_BY_OPTIONS}
    value={filters.sortBy}
    placeholder="Sort by"
    onValueChange={handleSortByChange}
    label="Sort By"
  />
  
  <CustomSelect
    options={SORT_DIRECTION_OPTIONS}
    value={filters.sortDirection}
    placeholder="Order"
    onValueChange={handleSortDirectionChange}
    label="Order"
  />
  
  {/* ... more filters ... */}
</CardHeaderSection>
```

**After:**
```typescript
import { DynamicFilterPanel } from '@/redux/features/business/components/dynamic-filter-panel';
import { FilterPanelConfig } from '@/redux/features/business/components/filter-types';

// In your page component
const filterConfig: FilterPanelConfig = {
  // ... config defined above
};

return (
  <div className="flex flex-1 flex-col gap-4 px-2">
    <div className="space-y-4">
      <DynamicFilterPanel config={filterConfig} />
      
      <DataTableWithPagination
        data={stockItemsContent}
        columns={columns}
        loading={isLoading}
        // ... other props
      />
    </div>
  </div>
);
```

## Code Reduction

### Before: 90 lines of JSX
```tsx
<CardHeaderSection ...>
  <CustomSelect ... />
  <CustomSelect ... />
  <CustomSelect ... />
  <ComboboxSelectBrand ... />
  <ComboboxSelectCategories ... />
  <CustomSelect ... />
  <CustomSelect ... />
  <CustomSelect ... />
  <div className="flex flex-col gap-1">
    <label>Low Stock Threshold</label>
    <Input ... />
  </div>
</CardHeaderSection>
```

### After: 2 lines of JSX + 60 lines of config
```tsx
<DynamicFilterPanel config={filterConfig} />
```

**Benefits:**
- Cleaner JSX
- Easier to understand at a glance
- Configuration is reusable
- Easy to show/hide filters conditionally

## Step 3: Optional - Extract Filter Config

For very large pages, extract the filter config to a separate file:

```typescript
// stock-items-filters.ts
import { FilterPanelConfig } from '@/redux/features/business/components/filter-types';

export const createStockItemsFilterConfig = (
  filters: StockItemsFilter,
  handlers: StockItemsHandlers,
  ui: StockItemsUI
): FilterPanelConfig => ({
  title: "Stock Items (Products & Sizes)",
  searchValue: filters.search,
  searchPlaceholder: "Search product name...",
  onSearchChange: handlers.handleSearchChange,
  
  filters: [
    // ... all filter configs
  ],
  
  buttonText: 'Add',
  buttonDisabled: true,
});
```

Then in page.tsx:
```typescript
import { createStockItemsFilterConfig } from '@/redux/features/business/components/stock-items-filters';

const filterConfig = createStockItemsFilterConfig(filters, handlers, ui);
return <DynamicFilterPanel config={filterConfig} />;
```

## Summary

✅ More maintainable code
✅ Reusable across pages
✅ Easier to add/remove filters
✅ Better separation of concerns
✅ Cleaner JSX markup
✅ Type-safe configuration

## Next Steps

1. Create the DynamicFilterPanel component (already done)
2. Update stock items page to use it
3. Update products page to use it
4. Create filter configs for other admin pages
5. Remove old filter-specific components as they're replaced
