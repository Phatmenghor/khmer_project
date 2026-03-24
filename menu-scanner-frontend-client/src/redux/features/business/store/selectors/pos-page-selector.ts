/**
 * POS Page - Selectors
 */

import { RootState } from "@/redux/store";

// ─── Base ───
export const selectPOSPageState = (state: RootState) => state.posPage;

// ─── Payment & Delivery ───
export const selectSelectedDeliveryOption = (state: RootState) =>
  state.posPage.selectedDeliveryOption;
export const selectSelectedPaymentOption = (state: RootState) =>
  state.posPage.selectedPaymentOption;

// ─── Products & Filters ───
export const selectProducts = (state: RootState) => state.posPage.products;
export const selectProductsLoading = (state: RootState) =>
  state.posPage.productsLoading;
export const selectProductsError = (state: RootState) =>
  state.posPage.productsError;
export const selectSearchTerm = (state: RootState) => state.posPage.searchTerm;
export const selectSelectedCategory = (state: RootState) =>
  state.posPage.selectedCategory;
export const selectSelectedBrand = (state: RootState) =>
  state.posPage.selectedBrand;
export const selectCategories = (state: RootState) => state.posPage.categories;
export const selectBrands = (state: RootState) => state.posPage.brands;
export const selectCategoriesLoading = (state: RootState) =>
  state.posPage.categoriesLoading;
export const selectBrandsLoading = (state: RootState) =>
  state.posPage.brandsLoading;
export const selectProductPage = (state: RootState) =>
  state.posPage.productPage;
export const selectHasMoreProducts = (state: RootState) =>
  state.posPage.hasMoreProducts;

// ─── Cart ───
export const selectCartItems = (state: RootState) => state.posPage.cartItems;
export const selectShowCart = (state: RootState) => state.posPage.showCart;

// ─── Order ───
export const selectCustomerNote = (state: RootState) =>
  state.posPage.customerNote;
export const selectIsSubmitting = (state: RootState) =>
  state.posPage.isSubmitting;

// ─── Modals ───
export const selectSizePickerProduct = (state: RootState) =>
  state.posPage.sizePickerProduct;
export const selectEditingCartItemId = (state: RootState) =>
  state.posPage.editingCartItemId;
export const selectSuccessOrder = (state: RootState) =>
  state.posPage.successOrder;
export const selectShowOrderDetailsModal = (state: RootState) =>
  state.posPage.showOrderDetailsModal;

// ─── UI ───
export const selectBrandOpen = (state: RootState) => state.posPage.brandOpen;
export const selectPromotionFilter = (state: RootState) =>
  state.posPage.promotionFilter;
export const selectPromotionOpen = (state: RootState) =>
  state.posPage.promotionOpen;
