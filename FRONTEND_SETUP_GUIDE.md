# Frontend Setup & Integration Guide

Step-by-step guide to implement the complete frontend architecture in your project.

---

## Prerequisites

```bash
npm install @reduxjs/toolkit react-redux axios
npm install -D @types/react @types/node typescript
```

---

## Phase 1: Project Structure Setup

### Step 1: Create Directory Structure

```bash
mkdir -p src/{app,components,redux,hooks,services,types,constants,utils,styles,lib,middleware,i18n}
mkdir -p src/components/{base,layout,auth,product,cart,order,common,providers}
mkdir -p src/redux/{features,store}
mkdir -p src/redux/features/{auth,product,cart,order,ui,notification}
mkdir -p src/services/{api,auth,product,cart,order}
mkdir -p src/constants/{app-resource,app-routes,status,defaults}
mkdir -p src/utils/{api,format,validation,storage,common}
mkdir -p src/types
```

### Step 2: Create Marker Files

```bash
touch src/types/index.ts
touch src/constants/index.ts
touch src/utils/index.ts
touch src/hooks/index.ts
touch src/services/index.ts
```

---

## Phase 2: Type Definitions

### Step 1: Create Base Types

**File: `/src/types/common.ts`**
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

export type SelectOption<T = string | number> = {
  label: string;
  value: T;
};

export interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

### Step 2: Create Domain Types

**File: `/src/types/auth.ts`**
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'EMPLOYEE' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
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

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**File: `/src/types/api.ts`**
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  field: string;
  message: string;
  code: string;
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

---

## Phase 3: Redux Setup

### Step 1: Configure Store

**File: `/src/redux/store.ts`**
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

**File: `/src/redux/hooks.ts`**
```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Step 2: Create Auth Feature

**File: `/src/redux/features/auth/authSlice.ts`**
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';
import { loginThunk, logoutThunk } from './authThunks';

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
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

**File: `/src/redux/features/auth/authThunks.ts`**
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { LoginRequest, LoginResponse } from '@/types';
import { authService } from '@/services';

export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
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
```

**File: `/src/redux/features/auth/authSelectors.ts`**
```typescript
import { RootState } from '@/types';

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
```

### Step 3: Create UI and Notification Features

**File: `/src/redux/features/ui/uiSlice.ts`**
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  modals: Record<string, boolean>;
  isLoading: boolean;
}

const initialState: UiState = {
  modals: {},
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { openModal, closeModal, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
```

**File: `/src/redux/features/notification/notificationSlice.ts`**
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      state.notifications.push({
        ...action.payload,
        id: `${Date.now()}-${Math.random()}`,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
```

---

## Phase 4: Custom Hooks

### Step 1: Create Auth Hook

**File: `/src/hooks/useAuth.ts`**
```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthError,
  selectIsAuthLoading,
} from '@/redux/features/auth/authSelectors';
import { loginThunk, logoutThunk } from '@/redux/features/auth/authThunks';
import { clearError } from '@/redux/features/auth/authSlice';
import { LoginRequest } from '@/types';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsAuthLoading);
  const error = useAppSelector(selectAuthError);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(loginThunk(credentials));
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
    login,
    logout,
    clearAuthError,
  };
};
```

### Step 2: Create Async Operation Hook

**File: `/src/hooks/useAsyncOperation.ts`**
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

  return { ...state, execute, clearError };
};
```

### Step 3: Export All Hooks

**File: `/src/hooks/index.ts`**
```typescript
export { useAuth } from './useAuth';
export { useAsyncOperation } from './useAsyncOperation';
export { useModalState } from './useModalState';
export { useFormState } from './useFormState';
export { useListFilters } from './useListFilters';
export { useNotification } from './useNotification';
```

---

## Phase 5: API Services

### Step 1: Create API Client

**File: `/src/services/api/client.ts`**
```typescript
import axios, { AxiosInstance } from 'axios';
import { getStoredToken, removeStoredToken } from '@/utils';

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    timeout: 30000,
  });

  instance.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        removeStoredToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createAxiosInstance();
```

**File: `/src/services/api/endpoints.ts`**
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  PRODUCT: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
  },
  ORDER: {
    LIST: '/orders',
    CREATE: '/orders',
  },
};
```

### Step 2: Create Auth Service

**File: `/src/services/auth/authService.ts`**
```typescript
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { LoginRequest, LoginResponse } from '@/types';
import { storeToken, removeStoredToken } from '@/utils';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      const { accessToken, refreshToken } = response.data.data;
      storeToken(accessToken, refreshToken);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      removeStoredToken();
    } catch (error) {
      removeStoredToken();
    }
  },
};
```

### Step 3: Export Services

**File: `/src/services/index.ts`**
```typescript
export { authService } from './auth/authService';
export { productService } from './product/productService';
export { cartService } from './cart/cartService';
export { orderService } from './order/orderService';
export { apiClient } from './api/client';
```

---

## Phase 6: Utilities

### Step 1: Create Storage Utils

**File: `/src/utils/storage/localStorage.ts`**
```typescript
export const getStoredValue = <T = any>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const setStoredValue = <T = any>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to store ${key}:`, error);
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
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

### Step 2: Create Format Utils

**File: `/src/utils/format/currencyFormat.ts`**
```typescript
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
```

**File: `/src/utils/format/dateFormat.ts`**
```typescript
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};
```

### Step 3: Export Utilities

**File: `/src/utils/index.ts`**
```typescript
export { getStoredValue, setStoredValue, getStoredToken, storeToken, removeStoredToken } from './storage/localStorage';
export { formatCurrency } from './format/currencyFormat';
export { formatDate } from './format/dateFormat';
```

---

## Phase 7: Constants

**File: `/src/constants/routes.ts`**
```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  CART: '/cart',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
  },
};
```

**File: `/src/constants/messages.ts`**
```typescript
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in',
    LOGOUT: 'Successfully logged out',
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
};
```

**File: `/src/constants/index.ts`**
```typescript
export * from './routes';
export * from './messages';
```

---

## Phase 8: Base Components

**File: `/src/components/base/Button.tsx`**
```typescript
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) => {
  const baseClass = 'px-4 py-2 rounded-lg font-semibold transition-all';
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant];

  return (
    <button
      className={`${baseClass} ${variantClass} ${
        fullWidth ? 'w-full' : ''
      } ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

**File: `/src/components/base/Input.tsx`**
```typescript
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const Input = ({ label, error, ...props }: InputProps) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <input
      className={`w-full px-3 py-2 border rounded-lg ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
```

**File: `/src/components/base/LoadingSpinner.tsx`**
```typescript
export const LoadingSpinner = ({ fullPage = false }: { fullPage?: boolean }) => {
  const spinner = (
    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
  );

  return fullPage ? (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
      {spinner}
    </div>
  ) : (
    <div className="flex justify-center">{spinner}</div>
  );
};
```

**File: `/src/components/base/index.ts`**
```typescript
export { Button } from './Button';
export { Input } from './Input';
export { LoadingSpinner } from './LoadingSpinner';
```

---

## Phase 9: Setup Providers

**File: `/src/components/providers/ReduxProvider.tsx`**
```typescript
'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ReactNode } from 'react';

export const ReduxProvider = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);
```

**File: `/src/app/layout.tsx`**
```typescript
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
```

---

## Phase 10: Create First Page

**File: `/src/app/(auth)/login/page.tsx`**
```typescript
'use client';

import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/base';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result) {
      router.push('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="primary" type="submit" isLoading={isLoading} fullWidth>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

## Verification Checklist

- [ ] All types defined and exported
- [ ] Redux store configured with all slices
- [ ] Custom hooks created and working
- [ ] API client set up with token handling
- [ ] Services created for all features
- [ ] Base components built
- [ ] Redux provider added to layout
- [ ] First page (login) working
- [ ] Authentication flow complete
- [ ] Error handling in place
- [ ] Tokens stored/retrieved from storage

---

## Common Issues & Solutions

### Issue: "Cannot find module @/types"
**Solution:** Ensure `tsconfig.json` has path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Redux not persisting token
**Solution:** Save token in localStorage via auth service before storing in Redux.

### Issue: Circular dependency errors
**Solution:** Ensure services don't import components, and components use hooks which import from Redux.

### Issue: Stale data in components
**Solution:** Always use Redux selectors, not local useState for fetched data.

---

## Next Steps

1. Implement remaining feature slices (Product, Cart, Order)
2. Build feature-specific components
3. Create admin pages
4. Add form validation
5. Implement pagination
6. Add error boundaries
7. Set up logging
8. Create unit tests
9. Optimize bundle size
10. Deploy to production

This modular approach makes it easy to add features incrementally.
