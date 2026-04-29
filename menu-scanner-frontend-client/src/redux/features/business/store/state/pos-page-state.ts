/**
 * POS Page - State Hook
 */

import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectPOSPageState,
  selectSelectedDeliveryOption,
  selectSelectedPaymentOption,
  selectProducts,
  selectProductsLoading,
  selectProductsError,
  selectSearchTerm,
  selectSelectedCategory,
  selectSelectedSubcategory,
  selectSelectedBrand,
  selectCategories,
  selectSubcategories,
  selectBrands,
  selectCategoriesLoading,
  selectSubcategoriesLoading,
  selectBrandsLoading,
  selectProductPage,
  selectHasMoreProducts,
  selectCartItems,
  selectCartPricing,
  selectShowCart,
  selectCustomerNote,
  selectIsSubmitting,
  selectSizePickerProduct,
  selectEditingCartItemId,
  selectLastSelectedCustomizations,
  selectSuccessOrder,
  selectShowOrderDetailsModal,
  selectBrandOpen,
  selectSubcategoryOpen,
  selectPromotionFilter,
  selectPromotionOpen,
} from "../selectors/pos-page-selector";

export const usePOSPageState = () => {
  const dispatch = useAppDispatch();

  const posPageState = useAppSelector(selectPOSPageState);
  const selectedDeliveryOption = useAppSelector(selectSelectedDeliveryOption);
  const selectedPaymentOption = useAppSelector(selectSelectedPaymentOption);
  const products = useAppSelector(selectProducts);
  const productsLoading = useAppSelector(selectProductsLoading);
  const productsError = useAppSelector(selectProductsError);
  const searchTerm = useAppSelector(selectSearchTerm);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const selectedSubcategory = useAppSelector(selectSelectedSubcategory);
  const selectedBrand = useAppSelector(selectSelectedBrand);
  const categories = useAppSelector(selectCategories);
  const subcategories = useAppSelector(selectSubcategories);
  const brands = useAppSelector(selectBrands);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);
  const subcategoriesLoading = useAppSelector(selectSubcategoriesLoading);
  const brandsLoading = useAppSelector(selectBrandsLoading);
  const productPage = useAppSelector(selectProductPage);
  const hasMoreProducts = useAppSelector(selectHasMoreProducts);
  const cartItems = useAppSelector(selectCartItems);
  const cartPricing = useAppSelector(selectCartPricing);
  const showCart = useAppSelector(selectShowCart);
  const customerNote = useAppSelector(selectCustomerNote);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const sizePickerProduct = useAppSelector(selectSizePickerProduct);
  const editingCartItemId = useAppSelector(selectEditingCartItemId);
  const lastSelectedCustomizations = useAppSelector(selectLastSelectedCustomizations);
  const successOrder = useAppSelector(selectSuccessOrder);
  const showOrderDetailsModal = useAppSelector(selectShowOrderDetailsModal);
  const brandOpen = useAppSelector(selectBrandOpen);
  const subcategoryOpen = useAppSelector(selectSubcategoryOpen);
  const promotionFilter = useAppSelector(selectPromotionFilter);
  const promotionOpen = useAppSelector(selectPromotionOpen);

  return {
    dispatch,
    posPageState,
    selectedDeliveryOption,
    selectedPaymentOption,
    products,
    productsLoading,
    productsError,
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    categories,
    subcategories,
    brands,
    categoriesLoading,
    subcategoriesLoading,
    brandsLoading,
    productPage,
    hasMoreProducts,
    cartItems,
    cartPricing,
    showCart,
    customerNote,
    isSubmitting,
    sizePickerProduct,
    editingCartItemId,
    lastSelectedCustomizations,
    successOrder,
    showOrderDetailsModal,
    brandOpen,
    subcategoryOpen,
    promotionFilter,
    promotionOpen,
  };
};
