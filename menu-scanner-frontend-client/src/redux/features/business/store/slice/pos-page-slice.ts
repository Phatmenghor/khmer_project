/**
 * POS Page - Redux Slice
 * State management for pos/page.tsx
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { POSPageState, PosPageCartItem } from "../models/type/pos-page-type";
import {
  fetchPOSPageCategoriesService,
  fetchPOSPageBrandsService,
  fetchPOSPageProductsService,
  createPOSPageOrderService,
} from "../thunks/pos-page-thunks";
import { ProductDetailResponseModel } from "../models/response/product-response";
import { DeliveryOptionsResponseModel } from "@/redux/features/master-data/store/models/response/delivery-options-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

const initialState: POSPageState = {
  selectedDeliveryOption: null,
  selectedPaymentOption: null,
  products: [],
  productsLoading: true,
  productsError: null,
  searchTerm: "",
  selectedCategory: null,
  selectedBrand: null,
  categories: [],
  brands: [],
  categoriesLoading: true,
  brandsLoading: true,
  productPage: 1,
  hasMoreProducts: true,
  cartItems: [],
  showCart: true,
  customerNote: "",
  isSubmitting: false,
  sizePickerProduct: null,
  editingCartItemId: null,
  successOrder: null,
  showOrderDetailsModal: false,
  brandOpen: false,
  promotionFilter: undefined,
  promotionOpen: false,
};

const posPageSlice = createSlice({
  name: "posPage",
  initialState,
  reducers: {
    // ─── Payment & Delivery ───
    setSelectedDeliveryOption: (state, action: PayloadAction<DeliveryOptionsResponseModel | null>) => {
      state.selectedDeliveryOption = action.payload;
    },
    setSelectedPaymentOption: (state, action: PayloadAction<any>) => {
      state.selectedPaymentOption = action.payload;
    },

    // ─── Products & Filters ───
    setProducts: (state, action: PayloadAction<ProductDetailResponseModel[]>) => {
      state.products = action.payload;
    },
    appendProducts: (state, action: PayloadAction<ProductDetailResponseModel[]>) => {
      state.products = [...state.products, ...action.payload];
    },
    setProductsLoading: (state, action: PayloadAction<boolean>) => {
      state.productsLoading = action.payload;
    },
    setProductsError: (state, action: PayloadAction<string | null>) => {
      state.productsError = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<CategoriesResponseModel | null>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedBrand: (state, action: PayloadAction<BrandResponseModel | null>) => {
      state.selectedBrand = action.payload;
    },
    setCategories: (state, action: PayloadAction<CategoriesResponseModel[]>) => {
      state.categories = action.payload;
    },
    setBrands: (state, action: PayloadAction<BrandResponseModel[]>) => {
      state.brands = action.payload;
    },
    setCategoriesLoading: (state, action: PayloadAction<boolean>) => {
      state.categoriesLoading = action.payload;
    },
    setBrandsLoading: (state, action: PayloadAction<boolean>) => {
      state.brandsLoading = action.payload;
    },
    setProductPage: (state, action: PayloadAction<number>) => {
      state.productPage = action.payload;
    },
    setHasMoreProducts: (state, action: PayloadAction<boolean>) => {
      state.hasMoreProducts = action.payload;
    },

    // ─── Cart ───
    setCartItems: (state, action: PayloadAction<PosPageCartItem[]>) => {
      state.cartItems = action.payload;
    },
    addCartItem: (state, action: PayloadAction<PosPageCartItem>) => {
      state.cartItems.push(action.payload);
    },
    updateCartItem: (state, action: PayloadAction<PosPageCartItem>) => {
      const index = state.cartItems.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.cartItems[index] = action.payload;
      }
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
    },
    clearCartItems: (state) => {
      state.cartItems = [];
    },
    setShowCart: (state, action: PayloadAction<boolean>) => {
      state.showCart = action.payload;
    },

    // ─── Order ───
    setCustomerNote: (state, action: PayloadAction<string>) => {
      state.customerNote = action.payload;
    },
    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    // ─── Modals ───
    setSizePickerProduct: (state, action: PayloadAction<ProductDetailResponseModel | null>) => {
      state.sizePickerProduct = action.payload;
    },
    setEditingCartItemId: (state, action: PayloadAction<string | null>) => {
      state.editingCartItemId = action.payload;
    },
    setSuccessOrder: (state, action: PayloadAction<{ orderNumber: string; total: number } | null>) => {
      state.successOrder = action.payload;
    },
    setShowOrderDetailsModal: (state, action: PayloadAction<boolean>) => {
      state.showOrderDetailsModal = action.payload;
    },

    // ─── UI ───
    setBrandOpen: (state, action: PayloadAction<boolean>) => {
      state.brandOpen = action.payload;
    },
    setPromotionFilter: (state, action: PayloadAction<boolean | undefined>) => {
      state.promotionFilter = action.payload;
    },
    setPromotionOpen: (state, action: PayloadAction<boolean>) => {
      state.promotionOpen = action.payload;
    },

    // ─── Reset ───
    resetPOSPageState: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPOSPageCategoriesService.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchPOSPageCategoriesService.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesLoading = false;
      })
      .addCase(fetchPOSPageCategoriesService.rejected, (state) => {
        state.categoriesLoading = false;
      });

    builder
      .addCase(fetchPOSPageBrandsService.pending, (state) => {
        state.brandsLoading = true;
      })
      .addCase(fetchPOSPageBrandsService.fulfilled, (state, action) => {
        state.brands = action.payload;
        state.brandsLoading = false;
      })
      .addCase(fetchPOSPageBrandsService.rejected, (state) => {
        state.brandsLoading = false;
      });

    builder
      .addCase(fetchPOSPageProductsService.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchPOSPageProductsService.fulfilled, (state, action) => {
        if (state.productPage === 1) {
          state.products = action.payload.content;
        } else {
          state.products = [...state.products, ...action.payload.content];
        }
        state.hasMoreProducts = !action.payload.last;
        state.productPage = action.payload.pageNo;
        state.productsLoading = false;
        state.productsError = null;
      })
      .addCase(fetchPOSPageProductsService.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string || "Failed to load products";
        // Stop infinite scroll on error
        state.hasMoreProducts = false;
      });

    builder
      .addCase(createPOSPageOrderService.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createPOSPageOrderService.fulfilled, (state, action) => {
        state.successOrder = {
          orderNumber: action.payload.orderNumber,
          total: action.payload.total,
        };
        state.cartItems = [];
        state.customerNote = "";
        state.selectedDeliveryOption = null;
        state.selectedPaymentOption = null;
        state.isSubmitting = false;
      })
      .addCase(createPOSPageOrderService.rejected, (state) => {
        state.isSubmitting = false;
      });
  },
});

export const {
  setSelectedDeliveryOption,
  setSelectedPaymentOption,
  setProducts,
  appendProducts,
  setProductsLoading,
  setProductsError,
  setSearchTerm,
  setSelectedCategory,
  setSelectedBrand,
  setCategories,
  setBrands,
  setCategoriesLoading,
  setBrandsLoading,
  setProductPage,
  setHasMoreProducts,
  setCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCartItems,
  setShowCart,
  setCustomerNote,
  setIsSubmitting,
  setSizePickerProduct,
  setEditingCartItemId,
  setSuccessOrder,
  setShowOrderDetailsModal,
  setBrandOpen,
  setPromotionFilter,
  setPromotionOpen,
  resetPOSPageState,
} = posPageSlice.actions;

export default posPageSlice.reducer;
