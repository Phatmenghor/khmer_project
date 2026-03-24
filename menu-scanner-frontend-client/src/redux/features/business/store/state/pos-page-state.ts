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
  selectSearchTerm,
  selectSelectedCategory,
  selectSelectedBrand,
  selectCategories,
  selectBrands,
  selectCategoriesLoading,
  selectBrandsLoading,
  selectProductPage,
  selectHasMoreProducts,
  selectCartItems,
  selectShowCart,
  selectCustomerNote,
  selectIsSubmitting,
  selectSizePickerProduct,
  selectEditingCartItemId,
  selectSuccessOrder,
  selectShowOrderDetailsModal,
  selectBrandOpen,
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
  const searchTerm = useAppSelector(selectSearchTerm);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const selectedBrand = useAppSelector(selectSelectedBrand);
  const categories = useAppSelector(selectCategories);
  const brands = useAppSelector(selectBrands);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);
  const brandsLoading = useAppSelector(selectBrandsLoading);
  const productPage = useAppSelector(selectProductPage);
  const hasMoreProducts = useAppSelector(selectHasMoreProducts);
  const cartItems = useAppSelector(selectCartItems);
  const showCart = useAppSelector(selectShowCart);
  const customerNote = useAppSelector(selectCustomerNote);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const sizePickerProduct = useAppSelector(selectSizePickerProduct);
  const editingCartItemId = useAppSelector(selectEditingCartItemId);
  const successOrder = useAppSelector(selectSuccessOrder);
  const showOrderDetailsModal = useAppSelector(selectShowOrderDetailsModal);
  const brandOpen = useAppSelector(selectBrandOpen);
  const promotionFilter = useAppSelector(selectPromotionFilter);
  const promotionOpen = useAppSelector(selectPromotionOpen);

  return {
    dispatch,
    posPageState,
    selectedDeliveryOption,
    selectedPaymentOption,
    products,
    productsLoading,
    searchTerm,
    selectedCategory,
    selectedBrand,
    categories,
    brands,
    categoriesLoading,
    brandsLoading,
    productPage,
    hasMoreProducts,
    cartItems,
    showCart,
    customerNote,
    isSubmitting,
    sizePickerProduct,
    editingCartItemId,
    successOrder,
    showOrderDetailsModal,
    brandOpen,
    promotionFilter,
    promotionOpen,
  };
};
