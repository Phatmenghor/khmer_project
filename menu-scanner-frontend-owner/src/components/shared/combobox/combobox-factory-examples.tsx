"use client";

/**
 * Factory-based combobox components to replace 15 nearly identical files
 * These examples show how to create typed combobox selectors
 *
 * This file demonstrates the factory pattern and can be split into separate
 * files when needed for better organization
 */

import { createComboboxSelect } from "./combobox-select-factory";
import type { BrandResponseModel } from "@/features/master-data/store/models/response/brand-response";
import type { CategoriesResponseModel } from "@/features/master-data/store/models/response/categories-response";

/**
 * Brand Selection Component
 * Replaces: combobox_select_brand.tsx and combobox_select_brand_public.tsx
 */
export const BrandCombobox = createComboboxSelect<BrandResponseModel>({
  getId: (brand) => brand.id,
  getLabel: (brand) => brand.name,
});

/**
 * Category Selection Component
 * Replaces: combobox_select_categories.tsx and combobox_select_categories_public.tsx
 */
export const CategoryCombobox = createComboboxSelect<CategoriesResponseModel>({
  getId: (category) => category.id,
  getLabel: (category) => category.name,
});

/**
 * Example usage patterns:
 *
 * // In component:
 * import { BrandCombobox, CategoryCombobox } from '@/components/shared/combobox/combobox-factory-examples';
 *
 * export function ProductFilter() {
 *   const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
 *   const brands = ... // fetch brands
 *
 *   return (
 *     <div>
 *       <label>Brand</label>
 *       <BrandCombobox
 *         items={brands}
 *         value={selectedBrand}
 *         onChange={setSelectedBrand}
 *         placeholder="Select a brand"
 *       />
 *     </div>
 *   );
 * }
 */

/**
 * To create more combobox types, follow this pattern:
 *
 * export const LocationCombobox = createComboboxSelect<LocationType>({
 *   getId: (location) => location.id,
 *   getLabel: (location) => location.name,
 * });
 *
 * export const PaymentMethodCombobox = createComboboxSelect<PaymentMethod>({
 *   getId: (method) => method.id,
 *   getLabel: (method) => method.name,
 * });
 *
 * And so on for all 15 combobox types...
 */
