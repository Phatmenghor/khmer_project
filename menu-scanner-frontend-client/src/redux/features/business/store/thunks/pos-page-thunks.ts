/**
 * POS Page - Thunks (Async Actions)
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClientWithAuth } from "@/utils/axios";
import { ProductDetailResponseModel } from "../models/response/product-response";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { POSCheckoutRequest, POSCheckoutResponse } from "../models/request/pos-checkout-request";

interface FetchProductsParams {
  page: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  hasPromotion?: boolean;
  reset?: boolean;
}

interface ProductsResponse {
  content: ProductDetailResponseModel[];
  pageNo: number;
  last: boolean;
}

// ─── Fetch Categories ───
export const fetchPOSPageCategoriesService = createAsyncThunk(
  "posPage/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: { content: CategoriesResponseModel[] };
      }>("/api/v1/categories/my-business/all", {
        pageNo: 1,
        pageSize: 100,
        status: "ACTIVE",
      });
      return response.data.data.content || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load categories"
      );
    }
  }
);

// ─── Fetch Brands ───
export const fetchPOSPageBrandsService = createAsyncThunk(
  "posPage/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: { content: BrandResponseModel[] };
      }>("/api/v1/brands/my-business/all", {
        pageNo: 1,
        pageSize: 100,
        status: "ACTIVE",
      });
      return response.data.data.content || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load brands"
      );
    }
  }
);

// ─── Fetch Products ───
export const fetchPOSPageProductsService = createAsyncThunk(
  "posPage/fetchProducts",
  async (params: FetchProductsParams, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: ProductsResponse;
      }>("/api/v1/products/admin/pos/all", {
        search: params.search || undefined,
        categoryId: params.categoryId || undefined,
        brandId: params.brandId || undefined,
        hasPromotion: params.hasPromotion,
        pageNo: params.page,
        pageSize: 30,
        status: "ACTIVE",
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load products"
      );
    }
  }
);

// ─── Create Order ───
interface CreateOrderParams {
  businessId: string;
  deliveryAddress: any;
  deliveryOption: any;
  cart: any;
  payment: any;
  customerNote: string;
  orderStatus: string;
}

interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  total: number;
}

export const createPOSPageOrderService = createAsyncThunk(
  "posPage/createOrder",
  async (params: CreateOrderParams, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: CreateOrderResponse;
      }>("/api/v1/orders/checkout", params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

// ─── POS Checkout (Admin Order Creation with Full Control) ───
/**
 * Create order from POS with admin capabilities
 * - Can set custom prices (override product prices)
 * - Can set promotions for items
 * - Can set delivery and payment details
 * - Orders automatically marked as from POS source
 * - Admin can control auto-confirmation
 */
export const createPOSCheckoutOrderService = createAsyncThunk(
  "posPage/createPOSCheckoutOrder",
  async (params: POSCheckoutRequest, { rejectWithValue }) => {
    try {
      const response = await axiosClientWithAuth.post<{
        data: POSCheckoutResponse;
      }>("/api/v1/orders/checkout-from-pos", params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create POS order"
      );
    }
  }
);
