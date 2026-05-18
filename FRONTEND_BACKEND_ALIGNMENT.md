# Frontend-Backend Architecture Alignment

This document shows how the frontend Redux Toolkit architecture mirrors the backend refactoring principles.

---

## Core Principles Alignment

### Backend Principle 1: Single Responsibility
**Backend:** Each service handles one domain (ProductService, OrderService, etc.)
**Frontend Match:** Custom hooks encapsulate domain logic
```typescript
// Backend
class ProductService {
  getProducts() { }
  createProduct() { }
}

// Frontend
const useProduct = () => {
  const fetchProducts = useCallback(...);
  const createProduct = useCallback(...);
  return { fetchProducts, createProduct };
};
```

### Backend Principle 2: DRY - No Code Duplication
**Backend:** Base classes, inheritance, utility methods
**Frontend Match:** Custom hooks, reusable components, utility functions

```typescript
// Backend: BaseService, BaseController, BaseRepository
// Frontend: useAsyncOperation, useListFilters, useFormState

// Used everywhere
const { isLoading, error, execute } = useAsyncOperation();
const { filters, getPaginationParams } = useListFilters();
```

### Backend Principle 3: Clear, Descriptive Naming
**Backend:** ServiceImpl, Repository, Enum constants (not abbreviations)
**Frontend Match:** Explicit Redux actions and selectors

```typescript
// Backend: ProductStatus.ACTIVE (not PROD_ACTIVE)
// Frontend: selectAllProducts, selectProductById (not getProds, getById)

export const selectAllProducts = (state: RootState) => state.product.items;
export const selectProductById = (id: string) => (state: RootState) =>
  state.product.items.find((p) => p.id === id);
```

### Backend Principle 4: Separation of Concerns
**Backend:** Layers (Controller → Service → Repository → Database)
**Frontend Match:** Redux layers (Components → Hooks → Reducers → Services → API)

```
Backend Architecture:
Controller (request handling)
  ↓
Service (business logic)
  ↓
Repository (data access)
  ↓
Database

Frontend Architecture:
Component (UI rendering)
  ↓
Custom Hook (state management)
  ↓
Redux (state store)
  ↓
Service (API calls)
  ↓
Backend API
```

### Backend Principle 5: Centralized Constants
**Backend:** BusinessConstants, ErrorCodes, SecurityConstants
**Frontend Match:** Centralized constants in `/src/constants/`

```typescript
// Backend
public class BusinessConstants {
  public static final String CURRENCY = "USD";
  public static final int DEFAULT_PAGE_SIZE = 20;
}

// Frontend
export const APP_CONFIG = {
  CURRENCY: 'USD',
  DEFAULT_PAGE_SIZE: 20,
};

export const ROUTES = { /* all app routes */ };
export const MESSAGES = { /* all UI messages */ };
```

### Backend Principle 6: Proper Error Handling
**Backend:** GlobalExceptionHandler, ApiException, ErrorResponse
**Frontend Match:** Error handling in thunks, error boundaries, notification system

```typescript
// Backend
@ExceptionHandler(ApiException.class)
public ApiResponse<Object> handleApiException(ApiException ex) {
  return ApiResponse.error(ex.getMessage(), ex.getErrorCode());
}

// Frontend
const loginThunk = createAsyncThunk(..., async (_, { rejectWithValue }) => {
  try {
    return await authService.login();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
```

### Backend Principle 7: Type Safety
**Backend:** Strongly typed, Enums, DTOs with validation
**Frontend Match:** TypeScript, interfaces, type guards

```typescript
// Backend
@Getter
@Setter
public class ProductDTO {
  private String id;
  private String name;
  private BigDecimal price;
  private ProductStatus status;
}

// Frontend
export interface Product {
  id: string;
  name: string;
  price: number;
  status: ProductStatus;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
```

---

## Architecture Layer Comparison

### Authentication Layer

**Backend:**
```java
// SecurityConfig - centralized security setup
@Configuration
public class SecurityConfig {
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) { }
}

// CustomUserDetailsService - user loading
public class CustomUserDetailsService implements UserDetailsService {
  public UserDetails loadUserByUsername(String username) { }
}

// SecurityUtils - security context access
public class SecurityUtils {
  public static User getCurrentUser() { }
}
```

**Frontend:**
```typescript
// Redux Auth Slice - centralized auth state
const authSlice = createSlice({
  name: 'auth',
  initialState: { user, token, isAuthenticated },
  // handles login, logout, token refresh
});

// useAuth Hook - auth abstraction
const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return { user, isAuthenticated, login, logout };
};

// authService - API communication
const authService = {
  login(credentials) { },
  logout() { },
  refreshToken() { },
};
```

### Data Access Layer

**Backend:**
```java
// Repository pattern - data access abstraction
public interface ProductRepository extends JpaRepository<Product, String> {
  List<Product> findByStatus(ProductStatus status);
  Page<Product> findAll(Pageable pageable);
}

// Service - business logic
@Service
public class ProductService {
  public Page<Product> getProducts(Pageable pageable) {
    return repository.findAll(pageable);
  }
}

// Controller - request handling
@RestController
@RequestMapping("/products")
public class ProductController {
  public ResponseEntity<ApiResponse<Page<ProductDTO>>> getProducts() { }
}
```

**Frontend:**
```typescript
// API Service - data fetching
const productService = {
  async getProducts(params) {
    return apiClient.get(API_ENDPOINTS.PRODUCT.LIST, { params });
  },
  async createProduct(data) {
    return apiClient.post(API_ENDPOINTS.PRODUCT.CREATE, data);
  },
};

// Redux Thunk - async data fetching
export const fetchProductsThunk = createAsyncThunk(
  'product/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await productService.getProducts(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Redux Slice - state management
const productSlice = createSlice({
  name: 'product',
  initialState: { items, isLoading, error },
  extraReducers: { /* handle thunk results */ },
});

// Custom Hook - component abstraction
const useProduct = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector(...);
  const fetchProducts = (params) => dispatch(fetchProductsThunk(params));
  return { items, isLoading, fetchProducts };
};
```

### Error Handling

**Backend:**
```java
// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException ex) {
    return ResponseEntity.status(ex.getStatusCode())
      .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode()));
  }
}

// Structured error response
public class ApiResponse<T> {
  private boolean success;
  private String message;
  private List<ApiError> errors;
}
```

**Frontend:**
```typescript
// Centralized error handling utility
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiException) {
    switch (error.statusCode) {
      case 401:
        return MESSAGES.ERROR.UNAUTHORIZED;
      case 422:
        return MESSAGES.ERROR.VALIDATION_FAILED;
      default:
        return error.message;
    }
  }
  return MESSAGES.ERROR.SOMETHING_WRONG;
};

// Error handling in hooks
const { error, execute } = useAsyncOperation();
if (error) {
  notify.error(getErrorMessage(error));
}

// Type-safe error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    logger.error('Component error:', error);
  }
}
```

### Configuration Management

**Backend:**
```yaml
# application.yml - centralized configuration
spring:
  datasource:
    url: ${DB_URL}
  jpa:
    hibernate:
      ddl-auto: validate

# BusinessConstants.java - app constants
public class BusinessConstants {
  public static final int DEFAULT_PAGE_SIZE = 20;
  public static final String CURRENCY = "USD";
  public static final long SESSION_TIMEOUT = 900000;
}
```

**Frontend:**
```typescript
// .env files - environment configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

// src/constants/app.ts - app constants
export const APP_CONFIG = {
  APP_NAME: 'EMenu',
  DEFAULT_PAGE_SIZE: 20,
  CURRENCY: 'USD',
};

export const TIMINGS = {
  SESSION_TIMEOUT: 15 * 60 * 1000,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 500,
};
```

---

## State Management Comparison

### Backend State (Stateless Architecture)
```java
@Service
@Transactional
public class ProductService {
  @Autowired
  private ProductRepository repository;
  
  // No state stored in service
  // Each request is independent
  // State stored in database
  
  public Page<Product> getProducts(Pageable pageable) {
    return repository.findAll(pageable);
  }
}
```

### Frontend State (Redux Store)
```typescript
// Redux store - centralized frontend state
const productSlice = createSlice({
  name: 'product',
  initialState: {
    items: [],           // current products
    selectedProduct: null,
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
  },
  // state changes via reducers
  reducers: { },
  extraReducers: { /* async operations */ },
});

// State accessed via selectors
const selectProducts = (state) => state.product.items;
const selectSelectedProduct = (state) => state.product.selectedProduct;
```

---

## Request/Response Flow

### Backend Flow
```
HTTP Request
  ↓
Controller (@RequestMapping)
  ↓
Service (business logic)
  ↓
Repository (data access)
  ↓
Database
  ↓
Response → ApiResponse<T>
```

### Frontend Flow
```
User Interaction (onClick, onChange)
  ↓
Component dispatches Redux Thunk
  ↓
Thunk calls API Service
  ↓
API Service calls axios
  ↓
Interceptor adds token, handles errors
  ↓
Backend API
  ↓
Response handled by Thunk
  ↓
Redux Reducer updates state
  ↓
Component re-renders via selector
```

---

## Validation Approach

### Backend Validation
```java
@Entity
public class Product {
  @NotBlank(message = "Product code is required")
  private String code;
  
  @DecimalMin("0.01")
  private BigDecimal price;
  
  @Size(min = 2, max = 255)
  private String name;
}

@RestController
public class ProductController {
  @PostMapping
  public ApiResponse<Product> create(@Valid @RequestBody CreateProductRequest req) {
    return ApiResponse.success(service.create(req));
  }
}
```

### Frontend Validation
```typescript
// Form-level validation
const validateFormData = (values) => {
  const errors = {};
  
  if (!values.code) errors.code = 'Code is required';
  if (values.price <= 0) errors.price = 'Price must be greater than 0';
  if (values.name.length < 2) errors.name = 'Minimum 2 characters';
  
  return errors;
};

// Input-level validation
const Input = ({ value, error, onChange }) => (
  <input
    value={value}
    onChange={onChange}
    className={error ? 'border-red-500' : 'border-gray-300'}
  />
);

// API response validation error handling
if (error.statusCode === 422) {
  const fieldErrors = mapApiErrors(error.details);
  setErrors(fieldErrors);
}
```

---

## Code Organization Comparison

### Backend Directory Structure
```
src/main/java/com/emenu/
├── config/
│   ├── SecurityConfig.java
│   ├── AsyncConfig.java
│   └── CacheConfig.java
├── security/
│   ├── SecurityUtils.java
│   └── CustomUserDetailsService.java
├── shared/
│   ├── dto/
│   │   ├── ApiResponse.java
│   │   ├── ErrorResponse.java
│   │   └── PaginationResponse.java
│   ├── constants/
│   │   ├── BusinessConstants.java
│   │   ├── ErrorCodes.java
│   │   └── SecurityConstants.java
├── [feature]/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   └── mapper/
```

### Frontend Directory Structure
```
src/
├── redux/
│   ├── store.ts
│   ├── hooks.ts
│   └── features/
│       ├── auth/
│       │   ├── authSlice.ts
│       │   ├── authThunks.ts
│       │   └── authSelectors.ts
│       └── [feature]/
├── hooks/
│   ├── useAuth.ts
│   ├── useProduct.ts
│   └── useAsyncOperation.ts
├── services/
│   ├── api/
│   │   ├── client.ts
│   │   └── endpoints.ts
│   └── [feature]/
├── types/
│   ├── auth.ts
│   ├── product.ts
│   └── api.ts
├── constants/
│   ├── routes.ts
│   ├── messages.ts
│   └── app.ts
├── components/
│   ├── base/
│   └── [feature]/
└── utils/
```

---

## Testing Strategy Alignment

### Backend Testing
```java
// Unit test - Service layer
@SpringBootTest
class ProductServiceTest {
  @Test
  void testCreateProduct() {
    ProductDTO dto = new ProductDTO(...);
    Product result = service.create(dto);
    assertEquals("Product Name", result.getName());
  }
}

// Integration test - Controller
@SpringBootTest
class ProductControllerTest {
  @Test
  void testGetProducts() {
    mockMvc.perform(get("/products"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true));
  }
}
```

### Frontend Testing
```typescript
// Unit test - Hook
describe('useProduct hook', () => {
  it('should fetch products', async () => {
    const { result } = renderHook(() => useProduct());
    await act(async () => {
      await result.current.fetchProducts({...});
    });
    expect(result.current.products).toBeDefined();
  });
});

// Component test
describe('ProductCard', () => {
  it('should render product', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Product Name')).toBeInTheDocument();
  });
});

// Integration test - Page
describe('ProductsPage', () => {
  it('should display products list', async () => {
    render(<ProductsPage />);
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
```

---

## Key Takeaways

| Aspect | Backend | Frontend |
|--------|---------|----------|
| **State Management** | Database + Spring Boot | Redux Store |
| **Data Fetching** | Repository + JPA | Services + Axios Thunks |
| **Validation** | Bean Validation | Form validation + API errors |
| **Error Handling** | GlobalExceptionHandler | Error utilities + hooks |
| **Configuration** | application.yml + Constants | .env + constants folder |
| **Separation of Concerns** | Controller/Service/Repo | Components/Hooks/Redux/Services |
| **Reusability** | Inheritance + Utils | Custom Hooks + Components |
| **Type Safety** | Strong typing + DTOs | TypeScript + Interfaces |
| **Request Handling** | @RestController | Axios interceptors |
| **Authentication** | SecurityConfig + JWT | Redux Auth Slice + Token Storage |

This parallel structure ensures consistency across the full stack and makes onboarding developers easier - they apply the same principles on both sides.
