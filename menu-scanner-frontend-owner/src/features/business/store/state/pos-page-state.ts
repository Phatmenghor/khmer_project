import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectPOSPageState,
  selectSelectedDeliveryOption,
  selectSelectedPaymentOption,
  selectProducts,
  selectProductsLoading,
  selectProductsError,
  selectSearchTerm,
  selectSelectedCategory,
  selectSelectedBrand,
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
  selectPromotionFilter,
  selectPromotionOpen,
  selectMinPrice,
  selectMaxPrice,
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
  const selectedBrand = useAppSelector(selectSelectedBrand);
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
  const promotionFilter = useAppSelector(selectPromotionFilter);
  const promotionOpen = useAppSelector(selectPromotionOpen);
  const minPrice = useAppSelector(selectMinPrice);
  const maxPrice = useAppSelector(selectMaxPrice);

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
    selectedBrand,
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
    promotionFilter,
    promotionOpen,
    minPrice,
    maxPrice,
  };
};
