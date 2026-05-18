# Frontend - Ready to Use Complete Examples

Copy-paste ready examples for implementing common features.

---

## Example 1: Complete Product Feature Implementation

### Types - `/src/types/product.ts`
```typescript
export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

export interface ProductFilter {
  categoryId?: string;
  status?: string;
  searchQuery?: string;
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

### Slice - `/src/redux/features/product/productSlice.ts`
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
      // Fetch Products
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
      // Fetch Detail
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
      // Create
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
      // Update
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
      // Delete
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

### Thunks - `/src/redux/features/product/productThunks.ts`
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Product, PaginationParams, CreateProductRequest } from '@/types';
import { productService } from '@/services';

export const fetchProductsThunk = createAsyncThunk<
  { content: Product[]; totalElements: number; currentPage: number },
  PaginationParams,
  { rejectValue: string }
>(
  'product/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await productService.getAll(params);
      return {
        content: response.data,
        totalElements: response.total,
        currentPage: params.pageNumber,
      };
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
      return await productService.getById(productId);
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
      return await productService.create(formData);
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
      return await productService.update(id, data);
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
      await productService.delete(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete product'
      );
    }
  }
);
```

### Selectors - `/src/redux/features/product/productSelectors.ts`
```typescript
import { RootState } from '@/redux/store';

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

### Hook - `/src/hooks/useProduct.ts`
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
import {
  setFilters,
  setCurrentPage,
  clearSelectedProduct,
} from '@/redux/features/product/productSlice';
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

### Service - `/src/services/product/productService.ts`
```typescript
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Product, PaginationParams, CreateProductRequest } from '@/types';

export const productService = {
  async getAll(params: PaginationParams): Promise<{ data: Product[]; total: number }> {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT.LIST, { params });
    return {
      data: response.data.data.content,
      total: response.data.data.totalElements,
    };
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCT.DETAIL(id));
    return response.data.data;
  },

  async create(formData: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCT.CREATE, formData);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    const response = await apiClient.put(API_ENDPOINTS.PRODUCT.UPDATE(id), data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCT.DELETE(id));
  },
};
```

### Components - `/src/components/product/ProductCard.tsx`
```typescript
'use client';

import { Product } from '@/types';
import { Button, Card } from '@/components/base';
import { formatCurrency } from '@/utils';
import Link from 'next/link';
import { ROUTES } from '@/constants';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={product.imageUrl || '/placeholder.png'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <p className="text-xl font-bold text-blue-600 mb-4">{formatCurrency(product.price)}</p>
        <div className="flex gap-2">
          <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className="flex-1">
            <Button variant="secondary" fullWidth>
              View
            </Button>
          </Link>
          <Button
            variant="primary"
            fullWidth
            onClick={() => onAddToCart?.(product.id)}
          >
            Add Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

### Components - `/src/components/product/ProductList.tsx`
```typescript
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  onAddToCart?: (productId: string) => void;
}

export const ProductList = ({ products, onAddToCart }: ProductListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};
```

### Page - `/src/app/(public)/products/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useProduct, useListFilters } from '@/hooks';
import { ProductList } from '@/components/product';
import { LoadingSpinner, Input, Button } from '@/components/base';
import { ROUTES } from '@/constants';
import Link from 'next/link';

export default function ProductsPage() {
  const { products, isLoading, error, fetchProducts } = useProduct();
  const { filters, getPaginationParams, setSearchQuery } = useListFilters(20);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchProducts(getPaginationParams());
  }, [filters.page, mounted]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Products</h1>
          <Link href={ROUTES.CART}>
            <Button variant="primary">View Cart</Button>
          </Link>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search products..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading && <LoadingSpinner fullPage />}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}

        {!isLoading && products.length > 0 && <ProductList products={products} />}
      </div>
    </div>
  );
}
```

---

## Example 2: Complete Admin CRUD Page

### Page - `/src/app/admin/products/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useProduct, useModalState, useAsyncOperation, useNotification } from '@/hooks';
import { ProductForm } from '@/components/product';
import { Button, Modal, LoadingSpinner } from '@/components/base';
import { formatDate, formatCurrency } from '@/utils';

interface ProductTableRow {
  id: string;
  name: string;
  code: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProduct();

  const { isOpen, open, close } = useModalState('product-form');
  const { isLoading: isSubmitting, execute } = useAsyncOperation();
  const { success, error: notifyError } = useNotification();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchProducts({ pageNumber: 1, pageSize: 50 });
  }, [mounted]);

  const handleOpenForm = (productId?: string) => {
    if (productId) {
      setEditingId(productId);
    } else {
      setEditingId(null);
    }
    open();
  };

  const handleSubmit = async (formData: any) => {
    await execute(async () => {
      if (editingId) {
        await updateProduct(editingId, formData);
        success('Product updated successfully');
      } else {
        await createProduct(formData);
        success('Product created successfully');
      }
      close();
      fetchProducts({ pageNumber: 1, pageSize: 50 });
    });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    await execute(async () => {
      await deleteProduct(productId);
      success('Product deleted successfully');
      fetchProducts({ pageNumber: 1, pageSize: 50 });
    });
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Button variant="primary" onClick={() => handleOpenForm()}>
          + Add Product
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No products found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left font-semibold">Code</th>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-right font-semibold">Price</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
                <th className="px-6 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{product.code}</td>
                  <td className="px-6 py-3 font-medium">{product.name}</td>
                  <td className="px-6 py-3 text-right">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        product.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{formatDate(product.createdAt)}</td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleOpenForm(product.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={editingId ? 'Edit Product' : 'Create Product'}
      >
        <ProductForm
          initialValues={
            editingId
              ? products.find((p) => p.id === editingId)
              : undefined
          }
          onSubmit={handleSubmit}
          submitText={editingId ? 'Update' : 'Create'}
        />
      </Modal>
    </div>
  );
}
```

### Form Component - `/src/components/product/ProductForm.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useFormState, useAsyncOperation } from '@/hooks';
import { Button, Input, Card } from '@/components/base';
import { Product, CreateProductRequest } from '@/types';

interface ProductFormProps {
  initialValues?: Partial<Product>;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  submitText?: string;
}

export const ProductForm = ({
  initialValues,
  onSubmit,
  submitText = 'Submit',
}: ProductFormProps) => {
  const { formState, values, setValue, setErrors } = useFormState({
    code: initialValues?.code || '',
    name: initialValues?.name || '',
    description: initialValues?.description || '',
    price: initialValues?.price || 0,
    categoryId: initialValues?.categoryId || '',
  });

  const { isLoading, error, execute, clearError } = useAsyncOperation();

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.code) errors.code = 'Code is required';
    if (!values.name) errors.name = 'Name is required';
    if (!values.description) errors.description = 'Description is required';
    if (values.price <= 0) errors.price = 'Price must be greater than 0';
    if (!values.categoryId) errors.categoryId = 'Category is required';

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    await execute(async () => {
      await onSubmit(values as CreateProductRequest);
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Input
          label="Code"
          value={values.code || ''}
          onChange={(e) => setValue('code', e.target.value)}
          error={formState.code?.error}
        />

        <Input
          label="Name"
          value={values.name || ''}
          onChange={(e) => setValue('name', e.target.value)}
          error={formState.name?.error}
        />

        <Input
          label="Description"
          value={values.description || ''}
          onChange={(e) => setValue('description', e.target.value)}
          error={formState.description?.error}
        />

        <Input
          label="Price"
          type="number"
          step="0.01"
          min="0"
          value={values.price || ''}
          onChange={(e) => setValue('price', Number(e.target.value))}
          error={formState.price?.error}
        />

        <Input
          label="Category ID"
          value={values.categoryId || ''}
          onChange={(e) => setValue('categoryId', e.target.value)}
          error={formState.categoryId?.error}
        />

        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          {submitText}
        </Button>
      </form>
    </Card>
  );
};
```

---

## Example 3: Authentication Flow

### Login Page - `/src/app/(auth)/login/page.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, LoadingSpinner } from '@/components/base';
import { useFormState } from '@/hooks';
import { ROUTES, MESSAGES } from '@/constants';
import { validateEmail } from '@/utils';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, login } = useAuth();
  const { values, setValue, formState, setErrors } = useFormState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push(ROUTES.HOME);
    }
  }, [isAuthenticated, router]);

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.email) {
      errors.email = MESSAGES.VALIDATION.EMAIL_REQUIRED;
    } else if (!validateEmail(values.email)) {
      errors.email = MESSAGES.VALIDATION.EMAIL_INVALID;
    }

    if (!values.password) {
      errors.password = MESSAGES.VALIDATION.PASSWORD_REQUIRED;
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const result = await login({
      email: values.email as string,
      password: values.password as string,
    });

    if (result) {
      router.push(ROUTES.HOME);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error === 'Invalid email or password'
              ? MESSAGES.ERROR.INVALID_CREDENTIALS
              : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={values.email || ''}
            onChange={(e) => setValue('email', e.target.value)}
            error={formState.email?.error}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={values.password || ''}
            onChange={(e) => setValue('password', e.target.value)}
            error={formState.password?.error}
          />

          <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
            Sign In
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href={ROUTES.REGISTER} className="text-blue-600 hover:underline">
            Register
          </a>
        </div>
      </Card>
    </div>
  );
}
```

---

All examples follow:
- Redux Toolkit best practices
- Custom hooks for state management
- Type safety with TypeScript
- Single responsibility principle
- DRY (no code duplication)
- Clear error handling
- Centralized constants and utilities

Copy and adapt these examples for your specific needs!
