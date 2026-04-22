# 🎭 Feature Visibility Control - Hide/Show by Business Type

This shows exactly where to hide/show features based on `BusinessSettings` flags.

---

## 🏗️ How It Works

### Business Settings Flags
```java
// BusinessSettings.java
@Column(name = "use_categories")
private Boolean useCategories = true;

@Column(name = "use_subcategories")
private Boolean useSubcategories = false;

@Column(name = "use_brands")
private Boolean useBrands = true;
```

### Database Value
```json
{
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "businessName": "Phatmenghor Coffee",
  "useCategories": true,        // Show categories
  "useSubcategories": false,    // Hide subcategories
  "useBrands": false            // Hide brands
}
```

---

## 🔄 BACKEND - Conditional Data

### 1. Product API Response

#### Before (Always returns all fields)
```java
// OLD - ProductController.java
@GetMapping("/{id}")
public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID id) {
    Product product = productService.getProduct(id);
    return ResponseEntity.ok(ProductResponse.from(product));
}

// Returns:
{
  "id": "p1",
  "name": "Espresso",
  "category": {...},           // ← Always included
  "subcategory": {...},        // ← Always included
  "brand": {...},              // ← Always included
  "price": 2.50
}
```

#### After (Conditionally include based on settings)
```java
// NEW - ProductController.java
@GetMapping("/{id}")
public ResponseEntity<ProductResponse> getProduct(
    @PathVariable UUID id,
    @RequestParam UUID businessId  // Add this
) {
    Product product = productService.getProduct(id);
    BusinessSettings settings = businessService.getSettings(businessId);
    
    // Create response with conditional data
    ProductResponse response = productService.getProductForBusiness(
        id, 
        businessId, 
        settings
    );
    
    return ResponseEntity.ok(response);
}

// Returns (for Coffee Shop - no brands/subcategories):
{
  "id": "p1",
  "name": "Espresso",
  "category": {...},           // ✅ Included
  "subcategory": null,         // ✅ Null (hidden)
  "brand": null,               // ✅ Null (hidden)
  "price": 2.50
}
```

### 2. Backend Service Implementation

```java
// ProductService.java
public ProductResponse getProductForBusiness(
    UUID productId,
    UUID businessId,
    BusinessSettings settings
) {
    Product product = productRepository.findById(productId);
    ProductResponse response = ProductResponse.from(product);
    
    // Hide category if business doesn't use categories
    if (!settings.getUseCategories()) {
        response.setCategory(null);
        response.setCategoryId(null);
    }
    
    // Hide subcategory if business doesn't use subcategories
    if (!settings.getUseSubcategories()) {
        response.setSubcategory(null);
        response.setSubcategoryId(null);
    }
    
    // Hide brand if business doesn't use brands
    if (!settings.getUseBrands()) {
        response.setBrand(null);
        response.setBrandId(null);
    }
    
    return response;
}

// Similar for lists
public List<ProductResponse> getProductsByCategory(
    UUID businessId,
    UUID categoryId,
    BusinessSettings settings
) {
    // Only return if business uses categories
    if (!settings.getUseCategories()) {
        return Collections.emptyList();
    }
    
    return productRepository
        .findByBusinessIdAndCategoryIdAndStatus(businessId, categoryId, ACTIVE)
        .stream()
        .map(p -> getProductForBusiness(p.getId(), businessId, settings))
        .toList();
}
```

### 3. Category Listing API

```java
// CategoryController.java
@GetMapping("/business/{businessId}")
public ResponseEntity<List<CategoryResponse>> getCategories(
    @PathVariable UUID businessId
) {
    BusinessSettings settings = businessService.getSettings(businessId);
    
    // Don't return any categories if business doesn't use them
    if (!settings.getUseCategories()) {
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    List<Category> categories = categoryRepository.findByBusinessId(businessId);
    return ResponseEntity.ok(
        categories.stream()
            .map(CategoryResponse::from)
            .toList()
    );
}

// Response
// For Coffee Shop (useCategories = true):
[
  {"id": "c1", "name": "Espresso Drinks"},
  {"id": "c2", "name": "Iced Beverages"}
]

// For Pharmacy (useCategories = false):
[]  // Empty list
```

### 4. Brand Listing API

```java
// BrandController.java
@GetMapping("/business/{businessId}")
public ResponseEntity<List<BrandResponse>> getBrands(
    @PathVariable UUID businessId
) {
    BusinessSettings settings = businessService.getSettings(businessId);
    
    // Don't return any brands if business doesn't use them
    if (!settings.getUseBrands()) {
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    List<Brand> brands = brandRepository.findByBusinessId(businessId);
    return ResponseEntity.ok(
        brands.stream()
            .map(BrandResponse::from)
            .toList()
    );
}

// Response
// For Clothing Store (useBrands = true):
[
  {"id": "b1", "name": "Nike"},
  {"id": "b2", "name": "Adidas"}
]

// For Coffee Shop (useBrands = false):
[]  // Empty list
```

---

## 🎨 FRONTEND - Conditional Rendering

### 1. Product Detail Page

#### Where to Hide/Show
```typescript
// src/app/(public)/products/[id]/page.tsx

export default function ProductDetailPage({ params }) {
  const { data: product } = useQuery(['product', params.id], ...);
  const { data: settings } = useQuery(['settings', businessId], ...);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p className="price">${product.price}</p>
      
      {/* CATEGORY - Show only if business uses categories */}
      {settings?.useCategories && product.category && (
        <div className="category-section">
          <Badge>{product.category.name}</Badge>
        </div>
      )}
      
      {/* SUBCATEGORY - Show only if business uses subcategories */}
      {settings?.useSubcategories && product.subcategory && (
        <div className="subcategory-section">
          <span className="breadcrumb">
            {product.category.name} > {product.subcategory.name}
          </span>
        </div>
      )}
      
      {/* BRAND - Show only if business uses brands */}
      {settings?.useBrands && product.brand && (
        <div className="brand-section">
          <img src={product.brand.imageUrl} alt={product.brand.name} />
          <p className="brand-name">Brand: {product.brand.name}</p>
        </div>
      )}
      
      {/* VARIANTS/SIZES - Always show */}
      <ProductVariantSelector variants={product.variants} />
      
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
```

### 2. Product Grid / Listing Page

```typescript
// src/app/(public)/products/page.tsx

export default function ProductsPage() {
  const { data: settings } = useQuery(['settings', businessId], ...);
  const { data: products } = useQuery(['products', businessId], ...);
  
  return (
    <div className="products-page">
      <PageHeader title="Products" />
      
      {/* CATEGORIES FILTER - Show only if used */}
      {settings?.useCategories && (
        <div className="categories-filter">
          <h3>Filter by Category</h3>
          {categories.map(cat => (
            <FilterButton key={cat.id} label={cat.name} />
          ))}
        </div>
      )}
      
      {/* BRANDS FILTER - Show only if used */}
      {settings?.useBrands && (
        <div className="brands-filter">
          <h3>Filter by Brand</h3>
          {brands.map(brand => (
            <FilterButton key={brand.id} label={brand.name} />
          ))}
        </div>
      )}
      
      {/* PRODUCTS GRID - Always show */}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            showCategory={settings?.useCategories}
            showBrand={settings?.useBrands}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3. Product Card Component

```typescript
// src/components/shared/card/product-card.tsx

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
  showBrand?: boolean;
}

export function ProductCard({ 
  product, 
  showCategory = true,
  showBrand = true 
}: ProductCardProps) {
  return (
    <Card className="product-card">
      {/* Image */}
      <img src={product.imageUrl} alt={product.name} />
      
      {/* Name */}
      <h3>{product.name}</h3>
      
      {/* Category Badge - Hidden if not used */}
      {showCategory && product.category && (
        <Badge className="category-badge">
          {product.category.name}
        </Badge>
      )}
      
      {/* Brand Badge - Hidden if not used */}
      {showBrand && product.brand && (
        <Badge className="brand-badge">
          {product.brand.name}
        </Badge>
      )}
      
      {/* Price - Always show */}
      <p className="price">${product.price}</p>
      
      {/* Rating - Always show */}
      <StarRating rating={product.rating} />
      
      {/* Add to Cart - Always show */}
      <button onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </Card>
  );
}
```

### 4. Category Navigation

```typescript
// src/components/shared/header/header.tsx

export function Header() {
  const { data: settings } = useQuery(['settings', businessId], ...);
  const { data: categories } = useQuery(['categories', businessId], ...);
  
  return (
    <header className="header">
      <div className="nav">
        {/* HOME - Always show */}
        <Link href="/">Home</Link>
        
        {/* CATEGORIES - Show only if used */}
        {settings?.useCategories && categories && (
          <DropdownMenu>
            <DropdownTrigger>Categories</DropdownTrigger>
            <DropdownContent>
              {categories.map(cat => (
                <Link key={cat.id} href={`/category/${cat.id}`}>
                  {cat.name}
                </Link>
              ))}
            </DropdownContent>
          </DropdownMenu>
        )}
        
        {/* BRANDS - Show only if used */}
        {settings?.useBrands && (
          <Link href="/brands">Brands</Link>
        )}
        
        {/* SEARCH - Always show */}
        <SearchBar />
        
        {/* CART - Always show */}
        <CartIcon />
      </div>
    </header>
  );
}
```

### 5. Admin Form - Show/Hide Fields

```typescript
// src/app/admin/products/[id]/edit/page.tsx

export function ProductEditForm({ product, businessId }) {
  const { data: settings } = useQuery(['settings', businessId], ...);
  const form = useForm();
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Name - Always show */}
      <input {...form.register('name')} placeholder="Product Name" />
      
      {/* Category - Show only if business uses it */}
      {settings?.useCategories && (
        <div>
          <label>Category *</label>
          <Select {...form.register('categoryId')}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Subcategory - Show only if business uses it */}
      {settings?.useSubcategories && (
        <div>
          <label>Subcategory</label>
          <Select {...form.register('subcategoryId')}>
            {subcategories.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Brand - Show only if business uses it */}
      {settings?.useBrands && (
        <div>
          <label>Brand</label>
          <Select {...form.register('brandId')}>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Sizes/Variants - Always show */}
      <VariantManager variants={product.variants} />
      
      <button type="submit">Save</button>
    </form>
  );
}
```

---

## 🔧 Redux State - Store Settings

```typescript
// src/redux/features/business/slice/business-slice.ts

const initialState = {
  settings: {
    businessId: null,
    businessName: null,
    useCategories: true,
    useSubcategories: false,
    useBrands: true,
    // ... other settings
  }
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setBusinessSettings: (state, action) => {
      state.settings = action.payload;
    }
  }
});

// Selectors
export const selectSettings = (state) => state.business.settings;
export const selectUseCategories = (state) => state.business.settings.useCategories;
export const selectUseSubcategories = (state) => state.business.settings.useSubcategories;
export const selectUseBrands = (state) => state.business.settings.useBrands;

// Usage in components
function MyComponent() {
  const useCategories = useSelector(selectUseCategories);
  
  if (!useCategories) return null;
  
  return <CategorySection />;
}
```

---

## 📊 Real Examples

### Example 1: Coffee Shop
```json
Business Settings:
{
  "useCategories": true,        // ✅ Show categories
  "useSubcategories": false,    // ❌ Hide subcategories
  "useBrands": false            // ❌ Hide brands
}

What Customer Sees:
├─ Navigation: Home, Categories, Search, Cart
├─ Category Section: "Espresso Drinks", "Iced Beverages"
├─ Product Page:
│  ├─ Product Name ✅
│  ├─ Category: "Espresso Drinks" ✅
│  ├─ Subcategory: (hidden) ❌
│  ├─ Brand: (hidden) ❌
│  └─ Sizes ✅
└─ Filters: By Category ✅, By Brand (hidden) ❌
```

### Example 2: Clothing Store
```json
Business Settings:
{
  "useCategories": true,        // ✅ Show categories
  "useSubcategories": true,     // ✅ Show subcategories
  "useBrands": true             // ✅ Show brands
}

What Customer Sees:
├─ Navigation: Home, Categories, Brands, Search, Cart
├─ Breadcrumb: Apparel > T-Shirts
├─ Product Page:
│  ├─ Product Name ✅
│  ├─ Category: "Apparel" ✅
│  ├─ Subcategory: "T-Shirts" ✅
│  ├─ Brand: "Nike" ✅
│  └─ Sizes/Colors ✅
└─ Filters: By Category ✅, By Brand ✅
```

### Example 3: Pharmacy
```json
Business Settings:
{
  "useCategories": true,        // ✅ Show categories
  "useSubcategories": false,    // ❌ Hide subcategories
  "useBrands": true             // ✅ Show brands
}

What Customer Sees:
├─ Navigation: Home, Categories, Brands, Search, Cart
├─ Category Section: "Pain Relief", "Vitamins"
├─ Product Page:
│  ├─ Product Name ✅
│  ├─ Category: "Pain Relief" ✅
│  ├─ Subcategory: (hidden) ❌
│  ├─ Brand: "Aspirin" ✅
│  └─ Quantity ✅
└─ Filters: By Category ✅, By Brand ✅
```

---

## 🎯 Implementation Checklist

### Backend
- [ ] Add flags to BusinessSettings entity
- [ ] Modify ProductService to filter by settings
- [ ] Modify ProductController to pass settings
- [ ] Modify CategoryController to check useCategories flag
- [ ] Modify BrandController to check useBrands flag
- [ ] Update DTOs to include conditional fields

### Frontend
- [ ] Store settings in Redux
- [ ] Fetch settings on app load
- [ ] Create useBusinessSettings custom hook
- [ ] Update Header component (conditional nav)
- [ ] Update ProductCard component (conditional fields)
- [ ] Update ProductDetailPage (conditional sections)
- [ ] Update ProductForm (conditional fields)
- [ ] Update Filters (conditional filter sections)

### Database
- [ ] Add columns to business_settings table:
```sql
ALTER TABLE business_settings ADD COLUMN use_categories BOOLEAN DEFAULT true;
ALTER TABLE business_settings ADD COLUMN use_subcategories BOOLEAN DEFAULT false;
ALTER TABLE business_settings ADD COLUMN use_brands BOOLEAN DEFAULT true;
```

---

## ✨ Key Benefits

✅ **One Code Base** - Same app works for all business types
✅ **Automatic** - Features hide/show based on settings
✅ **Clean** - No hardcoding business-specific logic
✅ **Scalable** - Add more flags as needed
✅ **Easy to Manage** - Admin toggles features on/off

---

**Ready to implement this?** 🚀
