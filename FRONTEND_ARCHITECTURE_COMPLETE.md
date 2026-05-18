# Complete Frontend Architecture - Redux Toolkit with Clean Code Principles

This guide provides a production-ready frontend project structure following clean code principles and matching the backend refactoring approach.

## Core Principles

1. **No unnecessary comments** - Code should be self-documenting
2. **DRY (Don't Repeat Yourself)** - No duplication, maximum reusability
3. **Single Responsibility** - Each module has one reason to change
4. **Clear naming** - English descriptive names, no abbreviations
5. **Separation of concerns** - Redux logic, Components, Hooks, Utils isolated
6. **Centralized state** - Single Redux store with normalized state
7. **Type safety** - Full TypeScript support
8. **Error handling** - Consistent error management across the app

---

## 1. Project Structure

```
src/
├── app/                          # Next.js app directory (routes)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── home/
│   │   │   └── page.tsx
│   │   └── products/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
│
├── components/                   # React components (UI + Features)
│   ├── base/                     # Base/shared UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Form.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Combobox.tsx
│   │   ├── Pagination.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── index.ts
│   │
│   ├── auth/                     # Auth feature components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── PasswordResetForm.tsx
│   │   └── index.ts
│   │
│   ├── product/                  # Product feature components
│   │   ├── ProductList.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── ProductForm.tsx
│   │   └── index.ts
│   │
│   ├── cart/                     # Cart feature components
│   │   ├── CartSummary.tsx
│   │   ├── CartItem.tsx
│   │   ├── CartList.tsx
│   │   └── index.ts
│   │
│   ├── order/                    # Order feature components
│   │   ├── OrderForm.tsx
│   │   ├── OrderList.tsx
│   │   ├── OrderDetail.tsx
│   │   └── index.ts
│   │
│   ├── common/                   # Reusable feature components
│   │   ├── ConfirmDialog.tsx
│   │   ├── SuccessMessage.tsx
│   │   ├── EmptyState.tsx
│   │   ├── DataTable.tsx
│   │   └── index.ts
│   │
│   └── providers/                # Context/Provider components
│       ├── ReduxProvider.tsx
│       ├── ToastProvider.tsx
│       └── index.ts
│
├── redux/                        # Redux Toolkit store setup
│   ├── store.ts                  # Store configuration
│   ├── hooks.ts                  # Custom Redux hooks (useAppDispatch, useAppSelector)
│   ├── rootReducer.ts            # Root reducer combination
│   │
│   └── features/                 # Feature slices
│       ├── auth/
│       │   ├── authSlice.ts      # Slice definition
│       │   ├── authSelectors.ts  # Selectors factory
│       │   ├── authThunks.ts     # Async thunks
│       │   └── index.ts
│       │
│       ├── product/
│       │   ├── productSlice.ts
│       │   ├── productSelectors.ts
│       │   ├── productThunks.ts
│       │   └── index.ts
│       │
│       ├── cart/
│       │   ├── cartSlice.ts
│       │   ├── cartSelectors.ts
│       │   ├── cartThunks.ts
│       │   └── index.ts
│       │
│       ├── order/
│       │   ├── orderSlice.ts
│       │   ├── orderSelectors.ts
│       │   ├── orderThunks.ts
│       │   └── index.ts
│       │
│       ├── ui/
│       │   ├── uiSlice.ts        # UI state (modals, loading, etc)
│       │   ├── uiSelectors.ts
│       │   └── index.ts
│       │
│       └── notification/
│           ├── notificationSlice.ts
│           ├── notificationSelectors.ts
│           └── index.ts
│
├── hooks/                        # Custom React hooks (eliminate prop drilling)
│   ├── useAuth.ts                # Auth state and actions
│   ├── useProduct.ts             # Product state and actions
│   ├── useCart.ts                # Cart state and actions
│   ├── useOrder.ts               # Order state and actions
│   ├── useAsyncOperation.ts       # Generic async operation handler
│   ├── useModalState.ts           # Modal management hook
│   ├── useFormState.ts            # Form state management
│   ├── useListFilters.ts          # List filtering/pagination hook
│   ├── useNotification.ts         # Notification/toast hook
│   ├── usePrevious.ts             # Previous value tracking
│   ├── useLocalStorage.ts         # Local storage hook
│   └── index.ts
│
├── services/                     # API clients and external integrations
│   ├── api/
│   │   ├── client.ts             # Axios instance with interceptors
│   │   ├── endpoints.ts          # API endpoint configuration
│   │   └── interceptors.ts       # Request/response interceptors
│   │
│   ├── auth/
│   │   ├── authService.ts        # Auth API calls
│   │   └── tokenService.ts       # Token management
│   │
│   ├── product/
│   │   └── productService.ts     # Product API calls
│   │
│   ├── cart/
│   │   └── cartService.ts        # Cart API calls
│   │
│   ├── order/
│   │   └── orderService.ts       # Order API calls
│   │
│   └── index.ts
│
├── types/                        # TypeScript types/interfaces
│   ├── index.ts
│   ├── auth.ts                   # Auth types
│   ├── product.ts                # Product types
│   ├── cart.ts                   # Cart types
│   ├── order.ts                  # Order types
│   ├── api.ts                    # API response/request types
│   ├── redux.ts                  # Redux state types
│   └── common.ts                 # Common types
│
├── constants/                    # Centralized constants
│   ├── app.ts                    # App configuration
│   ├── routes.ts                 # Route paths
│   ├── messages.ts               # User messages/labels
│   ├── timings.ts                # UI timing constants
│   ├── statusCodes.ts            # HTTP status codes
│   ├── errorCodes.ts             # Business error codes
│   ├── validationRules.ts        # Validation rules
│   └── index.ts
│
├── utils/                        # Utility functions
│   ├── api/
│   │   ├── errorHandler.ts       # Error handling utility
│   │   └── responseMapper.ts     # Response mapping utility
│   │
│   ├── format/
│   │   ├── dateFormat.ts         # Date formatting
│   │   ├── currencyFormat.ts     # Currency formatting
│   │   ├── stringFormat.ts       # String utilities
│   │   └── numberFormat.ts       # Number formatting
│   │
│   ├── validation/
│   │   ├── formValidation.ts     # Form validation rules
│   │   ├── emailValidator.ts     # Email validation
│   │   └── passwordValidator.ts  # Password validation
│   │
│   ├── storage/
│   │   ├── localStorage.ts       # Local storage wrapper
│   │   └── sessionStorage.ts     # Session storage wrapper
│   │
│   ├── common/
│   │   ├── logger.ts             # Logging utility
│   │   ├── delay.ts              # Delay utility
│   │   └── common.ts             # Common utilities
│   │
│   └── index.ts
│
├── styles/                       # Global styles
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
│
├── lib/                          # Third-party library wrappers
│   ├── axios.ts
│   ├── toast.ts
│   └── modal.ts
│
├── i18n/                         # Internationalization
│   ├── en.json
│   ├── km.json
│   └── i18n.ts
│
├── middleware/                   # Middleware/interceptors
│   ├── authMiddleware.ts
│   ├── errorMiddleware.ts
│   └── loggingMiddleware.ts
│
└── env.ts                        # Environment configuration
```

---

## 2. Type Definitions

### `/src/types/index.ts`
```typescript
export * from './auth';
export * from './product';
export * from './cart';
export * from './order';
export * from './api';
export * from './redux';
export * from './common';
```

### `/src/types/common.ts`
```typescript
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PaginationResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ListFiltersState {
  page: number;
  limit: number;
  searchQuery: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export type SelectOption<T = string | number> = {
  label: string;
  value: T;
};
```

### `/src/types/auth.ts`
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### `/src/types/product.ts`
```typescript
export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
  status?: ProductStatus;
}

export interface ProductFilter {
  categoryId?: string;
  status?: ProductStatus;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  filters: ProductFilter;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}
```

### `/src/types/cart.ts`
```typescript
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  lastModified: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  isLoading: boolean;
  error: string | null;
}

import { Product } from './product';
```

### `/src/types/order.ts`
```typescript
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  deliveryAddress: string;
  notes?: string;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface OrderState {
  items: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

import { Product } from './product';
```

### `/src/types/api.ts`
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: ApiError[];
  timestamp: string;
}

export interface ApiError {
  field: string;
  message: string;
  code: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: {
    content: T[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ApiError[];
  statusCode: number;
  timestamp: string;
}

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: ApiError[]
  ) {
    super(message);
    this.name = 'ApiException';
  }
}
```

### `/src/types/redux.ts`
```typescript
import { AuthState } from './auth';
import { ProductState } from './product';
import { CartState } from './cart';
import { OrderState } from './order';

export interface RootState {
  auth: AuthState;
  product: ProductState;
  cart: CartState;
  order: OrderState;
  ui: UiState;
  notification: NotificationState;
}

export interface UiState {
  modals: {
    [key: string]: boolean;
  };
  isLoading: boolean;
  selectedModal: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: number;
}

export interface NotificationState {
  notifications: Notification[];
}
```

---

## 3. Redux Toolkit Setup

### `/src/redux/store.ts`
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productReducer from './features/product/productSlice';
import cartReducer from './features/cart/cartSlice';
import orderReducer from './features/order/orderSlice';
import uiReducer from './features/ui/uiSlice';
import notificationReducer from './features/notification/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    ui: uiReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### `/src/redux/hooks.ts`
```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### `/src/redux/features/auth/authSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';
import { loginThunk, registerThunk, logoutThunk, refreshTokenThunk } from './authThunks';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
```

### `/src/redux/features/auth/authThunks.ts`
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';
import { authService } from '@/services';

export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }
);

export const registerThunk = createAsyncThunk<
  void,
  RegisterRequest,
  { rejectValue: string }
>(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      await authService.register(formData);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }
);

export const logoutThunk = createAsyncThunk<void>(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

export const refreshTokenThunk = createAsyncThunk<
  { accessToken: string; refreshToken: string },
  void,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error) {
      return rejectWithValue('Token refresh failed');
    }
  }
);
```

### `/src/redux/features/auth/authSelectors.ts`
```typescript
import { RootState } from '@/types';

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectUserId = (state: RootState) => state.auth.user?.id;

export const selectCanAdminister = (state: RootState) => {
  const user = state.auth.user;
  return user?.role === 'ADMIN' || user?.role === 'BUSINESS_OWNER';
};
```

### `/src/redux/features/product/productSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductState, Product, ProductFilter } from '@/types';
import {
  fetchProductsThunk,
  fetchProductDetailThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
} from './productThunks';

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  filters: {},
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilter>) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.content;
        state.totalCount = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductDetailThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProductThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createProductThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { setFilters, setCurrentPage, clearSelectedProduct, clearError } =
  productSlice.actions;
export default productSlice.reducer;
```

### `/src/redux/features/product/productThunks.ts`
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { PaginationParams, PaginationResponse, Product, CreateProductRequest } from '@/types';
import { productService } from '@/services';

export const fetchProductsThunk = createAsyncThunk<
  PaginationResponse<Product>,
  PaginationParams,
  { rejectValue: string }
>(
  'product/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await productService.getProducts(params);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch products'
      );
    }
  }
);

export const fetchProductDetailThunk = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>(
  'product/fetchDetail',
  async (productId, { rejectWithValue }) => {
    try {
      return await productService.getProductById(productId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch product'
      );
    }
  }
);

export const createProductThunk = createAsyncThunk<
  Product,
  CreateProductRequest,
  { rejectValue: string }
>(
  'product/create',
  async (formData, { rejectWithValue }) => {
    try {
      return await productService.createProduct(formData);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create product'
      );
    }
  }
);

export const updateProductThunk = createAsyncThunk<
  Product,
  { id: string; data: Partial<CreateProductRequest> },
  { rejectValue: string }
>(
  'product/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await productService.updateProduct(id, data);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update product'
      );
    }
  }
);

export const deleteProductThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'product/delete',
  async (productId, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete product'
      );
    }
  }
);
```

### `/src/redux/features/product/productSelectors.ts`
```typescript
import { RootState } from '@/types';

export const selectAllProducts = (state: RootState) => state.product.items;
export const selectSelectedProduct = (state: RootState) => state.product.selectedProduct;
export const selectProductFilters = (state: RootState) => state.product.filters;
export const selectProductError = (state: RootState) => state.product.error;
export const selectIsProductsLoading = (state: RootState) => state.product.isLoading;
export const selectProductTotalCount = (state: RootState) => state.product.totalCount;
export const selectProductCurrentPage = (state: RootState) => state.product.currentPage;
export const selectProductPageSize = (state: RootState) => state.product.pageSize;

export const selectTotalProductPages = (state: RootState) => {
  const { totalCount, pageSize } = state.product;
  return Math.ceil(totalCount / pageSize);
};

export const selectProductById = (productId: string) => (state: RootState) => {
  return state.product.items.find((p) => p.id === productId);
};
```

### `/src/redux/features/cart/cartSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem } from '@/types';
import {
  fetchCartThunk,
  addToCartThunk,
  updateCartItemThunk,
  removeFromCartThunk,
  clearCartThunk,
} from './cartThunks';

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalPrice = action.payload.totalPrice;
        state.totalQuantity = action.payload.totalQuantity;
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingItem = state.items.find(
          (item) => item.productId === action.payload.productId
        );
        if (existingItem) {
          existingItem.quantity += action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
        state.totalQuantity += action.payload.quantity;
        state.totalPrice += action.payload.totalPrice;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          const oldQuantity = state.items[index].quantity;
          const oldTotal = state.items[index].totalPrice;
          state.items[index] = action.payload;
          state.totalQuantity = state.totalQuantity - oldQuantity + action.payload.quantity;
          state.totalPrice = state.totalPrice - oldTotal + action.payload.totalPrice;
        }
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload);
        if (item) {
          state.totalQuantity -= item.quantity;
          state.totalPrice -= item.totalPrice;
        }
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
```

### `/src/redux/features/cart/cartThunks.ts`
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { CartItem, AddToCartRequest, UpdateCartItemRequest } from '@/types';
import { cartService } from '@/services';

export const fetchCartThunk = createAsyncThunk<
  { items: CartItem[]; totalPrice: number; totalQuantity: number },
  void,
  { rejectValue: string }
>(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.getCart();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch cart'
      );
    }
  }
);

export const addToCartThunk = createAsyncThunk<
  CartItem,
  AddToCartRequest,
  { rejectValue: string }
>(
  'cart/add',
  async (request, { rejectWithValue }) => {
    try {
      return await cartService.addToCart(request);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to add item to cart'
      );
    }
  }
);

export const updateCartItemThunk = createAsyncThunk<
  CartItem,
  UpdateCartItemRequest,
  { rejectValue: string }
>(
  'cart/updateItem',
  async (request, { rejectWithValue }) => {
    try {
      return await cartService.updateCartItem(request);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update cart item'
      );
    }
  }
);

export const removeFromCartThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'cart/remove',
  async (cartItemId, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(cartItemId);
      return cartItemId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to remove cart item'
      );
    }
  }
);

export const clearCartThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
    } catch (error) {
      return rejectWithValue('Failed to clear cart');
    }
  }
);
```

### `/src/redux/features/cart/cartSelectors.ts`
```typescript
import { RootState } from '@/types';

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotalPrice = (state: RootState) => state.cart.totalPrice;
export const selectCartTotalQuantity = (state: RootState) => state.cart.totalQuantity;
export const selectIsCartLoading = (state: RootState) => state.cart.isLoading;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartItemCount = (state: RootState) => state.cart.items.length;

export const selectIsCartEmpty = (state: RootState) => state.cart.items.length === 0;

export const selectCartItemById = (itemId: string) => (state: RootState) => {
  return state.cart.items.find((item) => item.id === itemId);
};
```

### `/src/redux/features/order/orderSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderState, Order } from '@/types';
import {
  fetchOrdersThunk,
  fetchOrderDetailThunk,
  createOrderThunk,
  updateOrderStatusThunk,
  cancelOrderThunk,
} from './orderThunks';

const initialState: OrderState = {
  items: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.content;
        state.totalCount = action.payload.totalElements;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderDetailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(createOrderThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      });
  },
});

export const { setCurrentPage, clearSelectedOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
```

### `/src/redux/features/order/orderThunks.ts`
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { PaginationParams, PaginationResponse, Order, CreateOrderRequest } from '@/types';
import { orderService } from '@/services';

export const fetchOrdersThunk = createAsyncThunk<
  PaginationResponse<Order>,
  PaginationParams,
  { rejectValue: string }
>(
  'order/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await orderService.getOrders(params);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch orders'
      );
    }
  }
);

export const fetchOrderDetailThunk = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>(
  'order/fetchDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.getOrderById(orderId);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch order'
      );
    }
  }
);

export const createOrderThunk = createAsyncThunk<
  Order,
  CreateOrderRequest,
  { rejectValue: string }
>(
  'order/create',
  async (request, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(request);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create order'
      );
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk<
  Order,
  { orderId: string; status: string },
  { rejectValue: string }
>(
  'order/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(orderId, { status });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update order status'
      );
    }
  }
);

export const cancelOrderThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'order/cancel',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderService.cancelOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to cancel order'
      );
    }
  }
);
```

### `/src/redux/features/ui/uiSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState } from '@/types';

const initialState: UiState = {
  modals: {},
  isLoading: false,
  selectedModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
      state.selectedModal = action.payload;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
      if (state.selectedModal === action.payload) {
        state.selectedModal = null;
      }
    },
    closeAllModals: (state) => {
      state.modals = {};
      state.selectedModal = null;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { openModal, closeModal, closeAllModals, setGlobalLoading } =
  uiSlice.actions;
export default uiSlice.reducer;
```

### `/src/redux/features/notification/notificationSlice.ts`
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, Notification } from '@/types';
import { generateId } from '@/utils';

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: generateId(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
```

---

## 4. Custom Hooks

### `/src/hooks/useAuth.ts`
```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthError,
  selectIsAuthLoading,
  selectUserRole,
} from '@/redux/features/auth/authSelectors';
import { loginThunk, registerThunk, logoutThunk } from '@/redux/features/auth/authThunks';
import { clearError } from '@/redux/features/auth/authSlice';
import { LoginRequest, RegisterRequest } from '@/types';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsAuthLoading);
  const error = useAppSelector(selectAuthError);
  const role = useAppSelector(selectUserRole);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(loginThunk(credentials));
      return result.payload;
    },
    [dispatch]
  );

  const register = useCallback(
    async (formData: RegisterRequest) => {
      const result = await dispatch(registerThunk(formData));
      return result.payload;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    role,
    login,
    register,
    logout,
    clearAuthError,
  };
};
```

### `/src/hooks/useProduct.ts`
```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  selectAllProducts,
  selectSelectedProduct,
  selectIsProductsLoading,
  selectProductError,
} from '@/redux/features/product/productSelectors';
import {
  fetchProductsThunk,
  fetchProductDetailThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
} from '@/redux/features/product/productThunks';
import { setFilters, setCurrentPage, clearSelectedProduct } from '@/redux/features/product/productSlice';
import { PaginationParams, ProductFilter, CreateProductRequest } from '@/types';
import { useCallback } from 'react';

export const useProduct = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const selectedProduct = useAppSelector(selectSelectedProduct);
  const isLoading = useAppSelector(selectIsProductsLoading);
  const error = useAppSelector(selectProductError);

  const fetchProducts = useCallback(
    (params: PaginationParams) => {
      return dispatch(fetchProductsThunk(params));
    },
    [dispatch]
  );

  const fetchProductDetail = useCallback(
    (productId: string) => {
      return dispatch(fetchProductDetailThunk(productId));
    },
    [dispatch]
  );

  const createProduct = useCallback(
    (formData: CreateProductRequest) => {
      return dispatch(createProductThunk(formData));
    },
    [dispatch]
  );

  const updateProduct = useCallback(
    (id: string, data: Partial<CreateProductRequest>) => {
      return dispatch(updateProductThunk({ id, data }));
    },
    [dispatch]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      return dispatch(deleteProductThunk(productId));
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (filters: ProductFilter) => {
      dispatch(setFilters(filters));
    },
    [dispatch]
  );

  const setPage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedProduct());
  }, [dispatch]);

  return {
    products,
    selectedProduct,
    isLoading,
    error,
    fetchProducts,
    fetchProductDetail,
    createProduct,
    updateProduct,
    deleteProduct,
    updateFilters,
    setPage,
    clearSelected,
  };
};
```

### `/src/hooks/useCart.ts`
```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  selectCartItems,
  selectCartTotalPrice,
  selectCartTotalQuantity,
  selectIsCartLoading,
  selectCartError,
} from '@/redux/features/cart/cartSelectors';
import {
  fetchCartThunk,
  addToCartThunk,
  updateCartItemThunk,
  removeFromCartThunk,
  clearCartThunk,
} from '@/redux/features/cart/cartThunks';
import { clearError } from '@/redux/features/cart/cartSlice';
import { AddToCartRequest, UpdateCartItemRequest } from '@/types';
import { useCallback } from 'react';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectCartTotalPrice);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const isLoading = useAppSelector(selectIsCartLoading);
  const error = useAppSelector(selectCartError);

  const fetchCart = useCallback(async () => {
    return dispatch(fetchCartThunk());
  }, [dispatch]);

  const addItem = useCallback(
    async (request: AddToCartRequest) => {
      return dispatch(addToCartThunk(request));
    },
    [dispatch]
  );

  const updateItem = useCallback(
    async (request: UpdateCartItemRequest) => {
      return dispatch(updateCartItemThunk(request));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      return dispatch(removeFromCartThunk(cartItemId));
    },
    [dispatch]
  );

  const clearCart = useCallback(async () => {
    return dispatch(clearCartThunk());
  }, [dispatch]);

  const clearCartError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    items,
    totalPrice,
    totalQuantity,
    isLoading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    clearCartError,
  };
};
```

### `/src/hooks/useAsyncOperation.ts`
```typescript
import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export const useAsyncOperation = () => {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    setState({ isLoading: true, error: null, success: false });

    try {
      const result = await operation();
      if (isMountedRef.current) {
        setState({ isLoading: false, error: null, success: true });
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (isMountedRef.current) {
        setState({ isLoading: false, error: errorMessage, success: false });
      }
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    execute,
    clearError,
    reset,
  };
};
```

### `/src/hooks/useModalState.ts`
```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openModal, closeModal } from '@/redux/features/ui/uiSlice';
import { useCallback } from 'react';

export const useModalState = (modalId: string) => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals[modalId] ?? false);

  const open = useCallback(() => {
    dispatch(openModal(modalId));
  }, [dispatch, modalId]);

  const close = useCallback(() => {
    dispatch(closeModal(modalId));
  }, [dispatch, modalId]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return { isOpen, open, close, toggle };
};
```

### `/src/hooks/useFormState.ts`
```typescript
import { useState, useCallback } from 'react';

interface FormField {
  value: any;
  error: string | null;
}

type FormState = Record<string, FormField>;

export const useFormState = <T extends Record<string, any>>(initialValues: T) => {
  const [formState, setFormState] = useState<FormState>(
    Object.entries(initialValues).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: { value, error: null },
      }),
      {}
    )
  );

  const getValues = useCallback(() => {
    return Object.entries(formState).reduce(
      (acc, [key, field]) => ({
        ...acc,
        [key]: field.value,
      }),
      {} as T
    );
  }, [formState]);

  const setValue = useCallback((fieldName: keyof T, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName as string],
        value,
        error: null,
      },
    }));
  }, []);

  const setFieldError = useCallback((fieldName: keyof T, error: string | null) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName as string],
        error,
      },
    }));
  }, []);

  const setErrors = useCallback((errors: Record<string, string | null>) => {
    setFormState((prev) => ({
      ...Object.keys(prev).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            ...prev[key],
            error: errors[key] ?? null,
          },
        }),
        {}
      ),
    }));
  }, []);

  const reset = useCallback(() => {
    setFormState(
      Object.entries(initialValues).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: { value, error: null },
        }),
        {}
      )
    );
  }, [initialValues]);

  return {
    formState,
    values: getValues(),
    setValue,
    setFieldError,
    setErrors,
    reset,
  };
};
```

### `/src/hooks/useListFilters.ts`
```typescript
import { useState, useCallback } from 'react';
import { ListFiltersState, PaginationParams } from '@/types';

export const useListFilters = (initialPageSize: number = 20) => {
  const [filters, setFilters] = useState<ListFiltersState>({
    page: 1,
    limit: initialPageSize,
    searchQuery: '',
    sortBy: 'createdAt',
    sortDirection: 'DESC',
  });

  const getPaginationParams = useCallback((): PaginationParams => ({
    pageNumber: filters.page,
    pageSize: filters.limit,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  }), [filters]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(1, page),
    }));
  }, []);

  const setPageSize = useCallback((limit: number) => {
    setFilters((prev) => ({
      ...prev,
      limit,
      page: 1,
    }));
  }, []);

  const setSortBy = useCallback((sortBy: string, sortDirection: 'ASC' | 'DESC' = 'DESC') => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortDirection,
    }));
  }, []);

  const reset = useCallback(() => {
    setFilters({
      page: 1,
      limit: initialPageSize,
      searchQuery: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    });
  }, [initialPageSize]);

  return {
    filters,
    getPaginationParams,
    setSearchQuery,
    setPage,
    setPageSize,
    setSortBy,
    reset,
  };
};
```

### `/src/hooks/useNotification.ts`
```typescript
import { useAppDispatch } from '@/redux/hooks';
import { addNotification } from '@/redux/features/notification/notificationSlice';
import { useCallback } from 'react';

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const notify = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => {
      dispatch(addNotification({ type, message, duration }));
    },
    [dispatch]
  );

  const success = useCallback(
    (message: string) => notify('success', message),
    [notify]
  );

  const error = useCallback(
    (message: string) => notify('error', message),
    [notify]
  );

  const warning = useCallback(
    (message: string) => notify('warning', message),
    [notify]
  );

  const info = useCallback(
    (message: string) => notify('info', message),
    [notify]
  );

  return { notify, success, error, warning, info };
};
```

### `/src/hooks/index.ts`
```typescript
export { useAuth } from './useAuth';
export { useProduct } from './useProduct';
export { useCart } from './useCart';
export { useAsyncOperation } from './useAsyncOperation';
export { useModalState } from './useModalState';
export { useFormState } from './useFormState';
export { useListFilters } from './useListFilters';
export { useNotification } from './useNotification';
export { useLocalStorage } from './useLocalStorage';
export { usePrevious } from './usePrevious';
```

---

## 5. Services/API Client

### `/src/services/api/client.ts`
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiException, ApiResponse } from '@/types';
import { getStoredToken, removeStoredToken, storeToken } from '@/utils';

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
            { refreshToken }
          );
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          storeToken(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          removeStoredToken();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createAxiosInstance();

export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const data = error.response?.data as ApiResponse<any>;

    throw new ApiException(
      status,
      data?.errors?.[0]?.code || 'UNKNOWN_ERROR',
      data?.message || 'An error occurred',
      data?.errors
    );
  }

  if (error instanceof Error) {
    throw new ApiException(500, 'UNKNOWN_ERROR', error.message);
  }

  throw new ApiException(500, 'UNKNOWN_ERROR', 'An unexpected error occurred');
};
```

### `/src/services/api/endpoints.ts`
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  PRODUCT: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    CATEGORIES: '/products/categories',
  },
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (id: string) => `/cart/items/${id}`,
    REMOVE_ITEM: (id: string) => `/cart/items/${id}`,
    CLEAR: '/cart/clear',
  },
  ORDER: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  USER: {
    PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
    CHANGE_PASSWORD: '/users/change-password',
  },
};
```

### `/src/services/auth/authService.ts`
```typescript
import { apiClient, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response.data.data!;
    } catch (error) {
      handleApiError(error);
    }
  },

  async register(formData: RegisterRequest): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, formData);
    } catch (error) {
      handleApiError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      handleApiError(error);
    }
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken }
      );
      return response.data.data!;
    } catch (error) {
      handleApiError(error);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    } catch (error) {
      handleApiError(error);
    }
  },
};
```

### `/src/services/product/productService.ts`
```typescript
import { apiClient, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Product, CreateProductRequest, PaginationParams, PaginatedApiResponse } from '@/types';

export const productService = {
  async getProducts(params: PaginationParams): Promise<{ content: Product[]; totalElements: number; currentPage: number }> {
    try {
      const response = await apiClient.get<PaginatedApiResponse<Product>>(
        API_ENDPOINTS.PRODUCT.LIST,
        { params }
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.PRODUCT.DETAIL(id));
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async createProduct(formData: CreateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.PRODUCT.CREATE,
        formData
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await apiClient.put<any>(
        API_ENDPOINTS.PRODUCT.UPDATE(id),
        data
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCT.DELETE(id));
    } catch (error) {
      handleApiError(error);
    }
  },
};
```

### `/src/services/cart/cartService.ts`
```typescript
import { apiClient, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { CartItem, AddToCartRequest, UpdateCartItemRequest, ApiResponse } from '@/types';

export const cartService = {
  async getCart(): Promise<{ items: CartItem[]; totalPrice: number; totalQuantity: number }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.CART.GET
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async addToCart(request: AddToCartRequest): Promise<CartItem> {
    try {
      const response = await apiClient.post<ApiResponse<CartItem>>(
        API_ENDPOINTS.CART.ADD_ITEM,
        request
      );
      return response.data.data!;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateCartItem(request: UpdateCartItemRequest): Promise<CartItem> {
    try {
      const response = await apiClient.put<ApiResponse<CartItem>>(
        API_ENDPOINTS.CART.UPDATE_ITEM(request.cartItemId),
        { quantity: request.quantity }
      );
      return response.data.data!;
    } catch (error) {
      handleApiError(error);
    }
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CART.REMOVE_ITEM(cartItemId));
    } catch (error) {
      handleApiError(error);
    }
  },

  async clearCart(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.CART.CLEAR);
    } catch (error) {
      handleApiError(error);
    }
  },
};
```

### `/src/services/order/orderService.ts`
```typescript
import { apiClient, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Order, CreateOrderRequest, UpdateOrderStatusRequest, PaginationParams, PaginatedApiResponse, ApiResponse } from '@/types';

export const orderService = {
  async getOrders(params: PaginationParams): Promise<{ content: Order[]; totalElements: number; currentPage: number }> {
    try {
      const response = await apiClient.get<PaginatedApiResponse<Order>>(
        API_ENDPOINTS.ORDER.LIST,
        { params }
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get<ApiResponse<Order>>(
        API_ENDPOINTS.ORDER.DETAIL(id)
      );
      return response.data.data!;
    } catch (error) {
      handleApiError(error);
    }
  },

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post<ApiResponse<Order>>(
        API_ENDPOINTS.ORDER.CREATE,
        request
      );
      return response.data.data!;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateOrderStatus(id: string, request: UpdateOrderStatusRequest): Promise<Order> {
    try {
      const response = await apiClient.put<ApiResponse<Order>>(
        API_ENDPOINTS.ORDER.UPDATE_STATUS(id),
        request
      );
      return response.data.data!;
    } catch (error) {
      handleApiError(error);
    }
  },

  async cancelOrder(id: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.ORDER.CANCEL(id));
    } catch (error) {
      handleApiError(error);
    }
  },
};
```

### `/src/services/index.ts`
```typescript
export { authService } from './auth/authService';
export { productService } from './product/productService';
export { cartService } from './cart/cartService';
export { orderService } from './order/orderService';
export { apiClient } from './api/client';
```

---

## 6. Constants

### `/src/constants/routes.ts`
```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    PRODUCT_NEW: '/admin/products/new',
    PRODUCT_EDIT: (id: string) => `/admin/products/${id}`,
    ORDERS: '/admin/orders',
    ORDERS_DETAIL: (id: string) => `/admin/orders/${id}`,
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
  },
};
```

### `/src/constants/messages.ts`
```typescript
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in',
    REGISTER: 'Registration successful. Please check your email to verify your account.',
    LOGOUT: 'Successfully logged out',
    PRODUCT_CREATED: 'Product created successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    ITEM_ADDED_TO_CART: 'Item added to cart',
    ITEM_REMOVED_FROM_CART: 'Item removed from cart',
    CART_CLEARED: 'Cart cleared',
    ORDER_CREATED: 'Order created successfully',
    ORDER_UPDATED: 'Order updated successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already registered',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    SOMETHING_WRONG: 'Something went wrong. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Please check your input and try again',
  },
  CONFIRMATION: {
    DELETE_PRODUCT: 'Are you sure you want to delete this product?',
    DELETE_ORDER: 'Are you sure you want to cancel this order?',
    CLEAR_CART: 'Are you sure you want to clear your cart?',
  },
  VALIDATION: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_WEAK: 'Password must be at least 8 characters',
    FIRST_NAME_REQUIRED: 'First name is required',
    LAST_NAME_REQUIRED: 'Last name is required',
  },
};
```

### `/src/constants/timings.ts`
```typescript
export const TIMINGS = {
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  API_TIMEOUT: 30000,
  SESSION_TIMEOUT: 15 * 60 * 1000,
  LOADING_TIMEOUT: 10000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};
```

### `/src/constants/app.ts`
```typescript
export const APP_CONFIG = {
  APP_NAME: 'EMenu',
  APP_VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CURRENCY: 'USD',
  TIMEZONE: 'Asia/Phnom_Penh',
};

export const PAGINATION_OPTIONS = [10, 20, 50, 100];
```

### `/src/constants/index.ts`
```typescript
export * from './routes';
export * from './messages';
export * from './timings';
export * from './app';
export * from './statusCodes';
export * from './errorCodes';
export * from './validationRules';
```

---

## 7. Utility Functions

### `/src/utils/api/errorHandler.ts`
```typescript
import { ApiException } from '@/types';
import { MESSAGES } from '@/constants';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiException) {
    if (error.statusCode === 401) {
      return MESSAGES.ERROR.UNAUTHORIZED;
    }
    if (error.statusCode === 404) {
      return MESSAGES.ERROR.NOT_FOUND;
    }
    if (error.statusCode === 422 || error.statusCode === 400) {
      return error.message || MESSAGES.ERROR.VALIDATION_FAILED;
    }
    if (error.statusCode >= 500) {
      return MESSAGES.ERROR.SERVER_ERROR;
    }
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return MESSAGES.ERROR.NETWORK_ERROR;
    }
    return error.message;
  }

  return MESSAGES.ERROR.SOMETHING_WRONG;
};

export const mapApiErrors = (details?: any[]): Record<string, string> => {
  if (!details) return {};
  return details.reduce(
    (acc, error) => ({
      ...acc,
      [error.field]: error.message,
    }),
    {}
  );
};
```

### `/src/utils/format/currencyFormat.ts`
```typescript
import { APP_CONFIG } from '@/constants';

export const formatCurrency = (value: number, currency: string = APP_CONFIG.CURRENCY): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, ''));
};
```

### `/src/utils/format/dateFormat.ts`
```typescript
export const formatDate = (date: string | Date, format: string = 'MM/dd/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(dateObj);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(dateObj);
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateObj);
};
```

### `/src/utils/validation/formValidation.ts`
```typescript
import { MESSAGES } from '@/constants';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
  if (rules.required && !value) {
    return 'This field is required';
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (rules.validate && !rules.validate(value)) {
    return 'Invalid value';
  }

  return null;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

### `/src/utils/storage/localStorage.ts`
```typescript
export const getStoredValue = <T = any>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue ?? null;
  } catch {
    return defaultValue ?? null;
  }
};

export const setStoredValue = <T = any>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to store value for key: ${key}`, error);
  }
};

export const removeStoredValue = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove value for key: ${key}`, error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage', error);
  }
};

export const getStoredToken = (): string | null => {
  return getStoredValue<string>('accessToken');
};

export const storeToken = (accessToken: string, refreshToken: string): void => {
  setStoredValue('accessToken', accessToken);
  setStoredValue('refreshToken', refreshToken);
};

export const removeStoredToken = (): void => {
  removeStoredValue('accessToken');
  removeStoredValue('refreshToken');
};
```

### `/src/utils/common/logger.ts`
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  info: (...args: any[]) => {
    if (isDevelopment) console.info(...args);
  },
  debug: (...args: any[]) => {
    if (isDevelopment) console.debug(...args);
  },
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

---

## 8. Base Components

### `/src/components/base/Button.tsx`
```typescript
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const buttonClass = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `.trim();

  return (
    <button
      className={buttonClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

### `/src/components/base/Input.tsx`
```typescript
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
}

export const Input = ({ label, error, helperText, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  );
};
```

### `/src/components/base/Modal.tsx`
```typescript
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-lg ${sizeStyles[size]} w-full mx-4`}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
        {actions && <div className="flex gap-3 p-6 border-t">{actions}</div>}
      </div>
    </div>
  );
};
```

### `/src/components/base/Card.tsx`
```typescript
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className = '', clickable = false, onClick }: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-6
        ${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

### `/src/components/base/LoadingSpinner.tsx`
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner = ({ size = 'md', fullPage = false }: LoadingSpinnerProps) => {
  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className={`${sizeStyles[size]} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center">{spinner}</div>;
};
```

---

## 9. Example Page Implementations

### `/src/app/(public)/products/page.tsx` - Product Listing Page
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useProduct, useListFilters } from '@/hooks';
import { ProductList, ProductFilter } from '@/components/product';
import { LoadingSpinner, Button } from '@/components/base';
import { ROUTES, MESSAGES } from '@/constants';
import Link from 'next/link';

export default function ProductsPage() {
  const { products, isLoading, error, fetchProducts } = useProduct();
  const { filters, getPaginationParams, setSearchQuery, setPage } = useListFilters(20);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchProducts(getPaginationParams());
  }, [filters, mounted, fetchProducts, getPaginationParams]);

  if (!mounted) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href={ROUTES.CART}>
          <Button variant="primary">View Cart</Button>
        </Link>
      </div>

      <ProductFilter onFilterChange={setSearchQuery} />

      {isLoading && <LoadingSpinner fullPage />}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {MESSAGES.ERROR.SOMETHING_WRONG}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <ProductList products={products} />
      )}
    </div>
  );
}
```

### `/src/components/product/ProductList.tsx` - Refactored Large Component
```typescript
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Pagination } from '@/components/base';

interface ProductListProps {
  products: Product[];
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
}

export const ProductList = ({
  products,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
}: ProductListProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange || (() => {})}
        />
      )}
    </>
  );
};
```

### `/src/components/product/ProductCard.tsx` - Reusable Component
```typescript
'use client';

import { Product } from '@/types';
import { Button, Card } from '@/components/base';
import { formatCurrency } from '@/utils';
import { useCart } from '@/hooks';
import { MESSAGES } from '@/constants';
import Link from 'next/link';
import { ROUTES } from '@/constants';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string, quantity: number) => void;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    await addItem({ productId: product.id, quantity: 1 });
  };

  return (
    <Card className="flex flex-col h-full">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
      <p className="text-xl font-bold text-blue-600 mb-4">{formatCurrency(product.price)}</p>
      <div className="flex gap-2">
        <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className="flex-1">
          <Button variant="secondary" fullWidth>
            View Details
          </Button>
        </Link>
        <Button variant="primary" fullWidth onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};
```

### `/src/app/cart/page.tsx` - Shopping Cart Page
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/hooks';
import { CartList, CartSummary } from '@/components/cart';
import { LoadingSpinner, Button, Card } from '@/components/base';
import { ROUTES, MESSAGES } from '@/constants';
import Link from 'next/link';

export default function CartPage() {
  const { items, totalPrice, isLoading, fetchCart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  if (!mounted) return null;

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <Link href={ROUTES.PRODUCTS}>
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartList items={items} />
        </div>

        <div>
          <CartSummary totalPrice={totalPrice} itemCount={items.length} />
          <Button
            variant="danger"
            fullWidth
            onClick={clearCart}
            className="mt-4"
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### `/src/app/admin/products/page.tsx` - Admin Product Management
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useProduct, useModalState } from '@/hooks';
import { Button, LoadingSpinner, Card } from '@/components/base';
import { ProductForm } from '@/components/product';
import { formatDate, formatCurrency } from '@/utils';
import { ROUTES, MESSAGES } from '@/constants';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { products, isLoading, fetchProducts } = useProduct();
  const { isOpen, open, close } = useModalState('product-form');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts({ pageNumber: 1, pageSize: 50 });
  }, [fetchProducts]);

  if (!mounted) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href={ROUTES.ADMIN.PRODUCT_NEW}>
          <Button variant="primary">Add Product</Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Category</th>
                <th className="border p-3 text-right">Price</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Created</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border p-3">{product.name}</td>
                  <td className="border p-3">{product.category.name}</td>
                  <td className="border p-3 text-right">{formatCurrency(product.price)}</td>
                  <td className="border p-3">{product.status}</td>
                  <td className="border p-3">{formatDate(product.createdAt)}</td>
                  <td className="border p-3 text-center">
                    <Link href={ROUTES.ADMIN.PRODUCT_EDIT(product.id)}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 10. Key Patterns & Best Practices

### Pattern 1: Custom Hooks eliminate Prop Drilling
**Before (with props):**
```typescript
<ProductList products={products} isLoading={isLoading} error={error} onAdd={handleAdd} />
```

**After (with hook):**
```typescript
export const useProductData = () => {
  const { products, isLoading, error } = useProduct();
  return { products, isLoading, error };
};
```

### Pattern 2: Redux Selectors for Type-Safe State
```typescript
const selectFilteredProducts = (state: RootState) => 
  state.product.items.filter(p => p.status === 'ACTIVE');
```

### Pattern 3: Normalized State Structure
```typescript
// Instead of nested:
products: [{ id, name, category: { id, name } }]

// Use normalized:
products: { id, categoryId }
categories: { id, name }
```

### Pattern 4: Async Operation Hook Pattern
```typescript
const { isLoading, error, execute } = useAsyncOperation();
await execute(() => productService.createProduct(data));
```

### Pattern 5: Component Composition
```typescript
// Large component split into smaller ones
<ProductPage>
  <ProductFilter />
  <ProductList />
  <Pagination />
</ProductPage>
```

---

## Summary

This complete frontend architecture provides:

1. **Redux Toolkit setup** with normalized state, proper selectors, and async thunks
2. **Custom hooks** that abstract Redux complexity and eliminate prop drilling
3. **Type-safe components** with full TypeScript support
4. **Separation of concerns** - API layer, Redux logic, React components, utilities
5. **Scalable structure** - Easy to add new features following the established patterns
6. **Error handling** - Consistent error management across the app
7. **Code reusability** - Shared components, hooks, and utilities
8. **Clean code principles** - Self-documenting code with minimal comments

File paths for implementation:
- `/src/redux/` - Redux setup and slices
- `/src/hooks/` - Custom hooks
- `/src/components/` - React components
- `/src/services/` - API clients
- `/src/types/` - TypeScript definitions
- `/src/constants/` - Centralized configuration
- `/src/utils/` - Utility functions
- `/src/app/` - Next.js pages

This structure scales from small to enterprise applications while maintaining clean code principles.
