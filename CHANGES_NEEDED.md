# 🔄 Changes Needed to Current Codebase

## Current State Analysis

### ✅ Already Implemented
```
Backend:
├─ User authentication ✅
├─ Business model ✅
├─ Product model ✅
├─ Category model ✅
├─ Brand model ✅
├─ ProductSize model ✅
├─ Order model ✅
├─ Basic API endpoints ✅
└─ Redux setup ✅

Frontend:
├─ Next.js pages structure ✅
├─ Redux state management ✅
├─ API services ✅
├─ Component library (shadcn/ui) ✅
├─ Footer (updated) ✅
├─ Pagination (icons removed) ✅
├─ Checkout (reorganized) ✅
└─ Product cards ✅
```

---

## 🔴 CRITICAL CHANGES NEEDED

### 1️⃣ DATABASE SCHEMA

#### New Tables to Add

```sql
-- Product Images
CREATE TABLE product_images (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    image_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT false,
    alt_text VARCHAR(255),
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false
);
CREATE INDEX idx_product_images ON product_images(product_id);

-- Product Tags
CREATE TABLE product_tags (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    tag VARCHAR(100),
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false
);
CREATE INDEX idx_product_tags ON product_tags(product_id, tag);

-- Related Products
CREATE TABLE related_products (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    related_product_id UUID NOT NULL REFERENCES products(id),
    reason VARCHAR(50), -- similar-category, often-bought-together
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false,
    UNIQUE(product_id, related_product_id)
);

-- Product Reviews
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false
);
CREATE INDEX idx_product_reviews ON product_reviews(product_id);

-- Product Bundles (Combos)
CREATE TABLE product_bundles (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255),
    description TEXT,
    bundle_price DECIMAL(10, 2),
    regular_price DECIMAL(10, 2),
    status VARCHAR(50),
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT false
);

-- Bundle Items
CREATE TABLE bundle_items (
    id UUID PRIMARY KEY,
    bundle_id UUID NOT NULL REFERENCES product_bundles(id),
    product_id UUID NOT NULL REFERENCES products(id),
    product_size_id UUID REFERENCES product_sizes(id),
    quantity INTEGER,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);
```

#### Modify Existing Tables

```sql
-- Add to products table
ALTER TABLE products ADD COLUMN visibility VARCHAR(50) DEFAULT 'PUBLIC'; -- PUBLIC, PRIVATE, COMING_SOON
ALTER TABLE products ADD COLUMN rating DECIMAL(3, 1);
ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;

-- Add to product_sizes table (already has attributes JSONB)
-- No change needed - attributes column already supports dynamic data

-- Add to categories table
ALTER TABLE categories ADD COLUMN image_url VARCHAR(500);

-- Add to business_settings
ALTER TABLE business_settings ADD COLUMN use_categories BOOLEAN DEFAULT true;
ALTER TABLE business_settings ADD COLUMN use_subcategories BOOLEAN DEFAULT false;
ALTER TABLE business_settings ADD COLUMN use_brands BOOLEAN DEFAULT true;
```

---

### 2️⃣ BACKEND CHANGES

#### New Entities to Create

```
src/main/java/com/emenu/features/main/models/
├─ ProductImage.java          (NEW)
├─ ProductTag.java            (NEW)
├─ RelatedProduct.java         (NEW)
├─ ProductReview.java          (NEW)
├─ ProductReviewImage.java     (NEW)
├─ ProductBundle.java          (NEW)
└─ BundleItem.java            (NEW)
```

#### Existing Entities to Modify

```java
// Product.java - ADD THESE FIELDS
private String visibility;        // PUBLIC, PRIVATE, COMING_SOON
private BigDecimal rating;        // Auto-calculated from reviews
private Integer reviewCount;      // Auto-calculated

@OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
private List<ProductImage> images;

@OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
private List<ProductTag> tags;

@OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
private List<ProductReview> reviews;

// Category.java - ADD THIS FIELD
private String imageUrl;

// ProductSize.java - ALREADY HAS attributes (JSONB)
// No changes needed
```

#### New Repositories

```
src/main/java/com/emenu/features/main/repositories/
├─ ProductImageRepository.java         (NEW)
├─ ProductTagRepository.java           (NEW)
├─ RelatedProductRepository.java       (NEW)
├─ ProductReviewRepository.java        (NEW)
├─ ProductBundleRepository.java        (NEW)
└─ BundleItemRepository.java          (NEW)
```

#### New Services

```
src/main/java/com/emenu/features/main/services/
├─ ProductImageService.java            (NEW)
├─ ProductTagService.java              (NEW)
├─ RelatedProductService.java          (NEW)
├─ ProductReviewService.java           (NEW)
├─ ProductBundleService.java           (NEW)
└─ ProductFilterService.java           (NEW) - For filtering by tags, price, etc
```

#### Update Existing Services

```java
// ProductService.java - MODIFY THESE METHODS
public ProductResponse getProduct(UUID id) {
    // ADD: Load images, tags, reviews, rating
}

public List<ProductResponse> getProductsByCategory(UUID categoryId) {
    // MODIFY: Implement dynamic filtering
}

public List<ProductResponse> searchProducts(String query) {
    // ADD: Search by tags, implement fuzzy matching
}

// ADD NEW METHODS:
public List<ProductResponse> getRelatedProducts(UUID productId);
public List<ProductResponse> filterByTags(UUID businessId, List<String> tags);
public List<ProductResponse> filterByPrice(UUID businessId, BigDecimal minPrice, BigDecimal maxPrice);
public void calculateProductRating(UUID productId); // Auto-calc from reviews
```

#### Update DTOs

```
src/main/java/com/emenu/features/main/dto/response/
├─ ProductResponse.java - ADD FIELDS:
│   ├─ List<ProductImageResponse> images
│   ├─ List<String> tags
│   ├─ BigDecimal rating
│   ├─ Integer reviewCount
│   ├─ List<ProductReviewResponse> topReviews
│   ├─ List<RelatedProductResponse> relatedProducts
│   └─ String visibility
│
├─ ProductImageResponse.java           (NEW)
├─ ProductTagResponse.java             (NEW)
├─ ProductReviewResponse.java          (NEW)
├─ ProductBundleResponse.java          (NEW)
└─ RelatedProductResponse.java         (NEW)

src/main/java/com/emenu/features/main/dto/request/
├─ ProductCreateRequest.java - ADD:
│   ├─ List<String> tags
│   ├─ String visibility
│   └─ List<UUID> imageIds
│
└─ ProductReviewCreateRequest.java     (NEW)
```

#### New API Endpoints

```java
// ProductController.java - ADD THESE ENDPOINTS

// Images
POST   /api/products/{id}/images              - Upload product image
DELETE /api/products/{id}/images/{imageId}    - Delete image

// Tags
GET    /api/products/{id}/tags                - Get product tags
POST   /api/products/{id}/tags                - Add tag

// Reviews
GET    /api/products/{id}/reviews             - Get product reviews
POST   /api/products/{id}/reviews             - Create review
PUT    /api/reviews/{id}                      - Update review
DELETE /api/reviews/{id}                      - Delete review

// Related Products
GET    /api/products/{id}/related             - Get related products

// Filtering
GET    /api/products/filter?tags=bestseller,vegan  - Filter by tags
GET    /api/products/filter?minPrice=0&maxPrice=100 - Filter by price
GET    /api/products/filter?rating=4          - Filter by rating

// Bundles
GET    /api/bundles/business/{businessId}     - Get business bundles
GET    /api/bundles/{id}                      - Get bundle details
POST   /api/bundles                           - Create bundle (Admin)
PUT    /api/bundles/{id}                      - Update bundle (Admin)
DELETE /api/bundles/{id}                      - Delete bundle (Admin)
```

---

### 3️⃣ FRONTEND CHANGES

#### New Pages to Create

```
src/app/(public)/
├─ products/page.tsx                   (MODIFY - add filters)
├─ products/[id]/page.tsx              (MODIFY - add reviews, images, related)
├─ search/page.tsx                     (NEW - search with filters)
├─ cart/page.tsx                       (MODIFY - if not exists)
└─ orders/page.tsx                     (MODIFY - if not exists)

src/app/admin/
├─ products/page.tsx                   (NEW or MODIFY)
├─ products/[id]/edit/page.tsx         (NEW or MODIFY)
├─ bundles/page.tsx                    (NEW)
├─ reviews/page.tsx                    (NEW)
└─ inventory/page.tsx                  (NEW)
```

#### New Components to Create

```
src/components/shared/card/
├─ ProductCard.tsx                     (MODIFY - add rating, tags)
├─ ReviewCard.tsx                      (NEW)
└─ BundleCard.tsx                      (NEW)

src/components/shared/form/
├─ ProductImageUpload.tsx              (NEW)
├─ ProductTagInput.tsx                 (NEW)
├─ ReviewForm.tsx                      (NEW)
└─ BundleForm.tsx                      (NEW)

src/components/(feature)/product/
├─ ProductGallery.tsx                  (NEW - image carousel)
├─ ProductVariantSelector.tsx          (NEW or MODIFY)
├─ ProductReviewSection.tsx            (NEW)
├─ ProductRelatedSection.tsx           (NEW)
├─ ProductTagsFilter.tsx               (NEW)
└─ PriceRangeFilter.tsx                (NEW)

src/components/(feature)/bundle/
├─ BundleCard.tsx                      (NEW)
├─ BundleDetail.tsx                    (NEW)
└─ BundleForm.tsx                      (NEW)
```

#### Redux Modifications

```
src/redux/features/
├─ products/
│   ├─ store/
│   │   ├─ selectors/
│   │   │   ├─ products-selector.ts    (MODIFY - add filtered products)
│   │   │   └─ filters-selector.ts     (NEW)
│   │   ├─ slices/
│   │   │   ├─ products-slice.ts       (MODIFY)
│   │   │   ├─ filters-slice.ts        (NEW)
│   │   │   └─ reviews-slice.ts        (NEW)
│   │   └─ thunks/
│   │       ├─ products-thunks.ts      (MODIFY)
│   │       ├─ reviews-thunks.ts       (NEW)
│   │       └─ related-products-thunks.ts (NEW)
│   │
│   └─ components/
│       ├─ product-form.tsx            (NEW/MODIFY)
│       └─ product-filters.tsx         (NEW)
│
├─ bundles/                            (NEW)
│   ├─ store/
│   │   ├─ models/
│   │   ├─ slices/
│   │   ├─ selectors/
│   │   └─ thunks/
│   └─ components/
│
└─ filters/                            (NEW)
    ├─ store/
    │   ├─ slices/
    │   ├─ selectors/
    │   └─ types/
    └─ components/
```

#### API Services to Modify/Create

```
src/services/
├─ product-service.ts                  (MODIFY)
│   ├─ getProduct()                    (MODIFY - load full data)
│   ├─ searchProducts()                (MODIFY)
│   ├─ filterByTags()                  (NEW)
│   ├─ filterByPrice()                 (NEW)
│   ├─ getRelatedProducts()            (NEW)
│   └─ getProductReviews()             (NEW)
│
├─ review-service.ts                   (NEW)
│   ├─ getProductReviews()
│   ├─ createReview()
│   ├─ updateReview()
│   └─ deleteReview()
│
├─ bundle-service.ts                   (NEW)
│   ├─ getBundles()
│   ├─ getBundle()
│   ├─ createBundle()
│   ├─ updateBundle()
│   └─ deleteBundle()
│
└─ image-service.ts                    (NEW)
    ├─ uploadProductImage()
    ├─ deleteProductImage()
    └─ reorderImages()
```

---

### 4️⃣ SUMMARY OF CHANGES

| Component | Status | Change Type |
|-----------|--------|-------------|
| **Database** | ❌ | Add 6 new tables, modify 3 existing |
| **Backend Models** | ❌ | Add 7 new entities |
| **Backend Repositories** | ❌ | Add 6 new repositories |
| **Backend Services** | ❌ | Add 6 new services, modify 1 |
| **Backend Controllers** | ❌ | Modify 1, add 20+ endpoints |
| **Frontend Pages** | ⚠️ | Add 4-6 new pages, modify 2 existing |
| **Frontend Components** | ❌ | Add 15+ new components |
| **Redux Store** | ⚠️ | Add 3 new slices, modify 2 existing |
| **API Services** | ⚠️ | Add 4 new services, modify 1 existing |

---

## 🎯 QUICK CHANGE CHECKLIST

### Phase 1: Database (1-2 days)
- [ ] Create migration V5__add_product_features.sql
- [ ] Add product_images table
- [ ] Add product_tags table
- [ ] Add related_products table
- [ ] Add product_reviews table
- [ ] Add product_bundles table
- [ ] Modify products table (visibility, rating, review_count)
- [ ] Run migration

### Phase 2: Backend Models & Services (3-4 days)
- [ ] Create ProductImage entity
- [ ] Create ProductTag entity
- [ ] Create RelatedProduct entity
- [ ] Create ProductReview entity
- [ ] Create ProductBundle entity
- [ ] Create repositories for each
- [ ] Create services for each
- [ ] Update Product entity
- [ ] Create DTOs

### Phase 3: Backend APIs (2-3 days)
- [ ] Add image endpoints
- [ ] Add tag endpoints
- [ ] Add review endpoints
- [ ] Add related products endpoint
- [ ] Add filter endpoints
- [ ] Add bundle endpoints
- [ ] Test all endpoints

### Phase 4: Frontend Components (3-4 days)
- [ ] Create ProductGallery component
- [ ] Create ReviewSection component
- [ ] Create ReviewForm component
- [ ] Create ProductFilters component
- [ ] Create RelatedProducts component
- [ ] Create BundleCard components

### Phase 5: Frontend Pages (2-3 days)
- [ ] Update product detail page
- [ ] Update products grid page
- [ ] Update search page
- [ ] Add admin product management
- [ ] Add admin reviews page

### Phase 6: Redux Integration (1-2 days)
- [ ] Add product filters slice
- [ ] Add reviews slice
- [ ] Add bundles slice
- [ ] Add selectors
- [ ] Add thunks

### Phase 7: Testing & Polish (2-3 days)
- [ ] Test all APIs
- [ ] Test all pages
- [ ] Mobile responsive check
- [ ] Performance optimization

**Total: 14-21 days for complete implementation**

---

## ✨ Key Points

1. **No Breaking Changes** - Existing code still works
2. **Backward Compatible** - Old products work without new features
3. **Optional Features** - All new features are optional per business
4. **Easy to Phase** - Can build features one at a time
5. **Database Migrations** - Use Flyway for safe schema changes

---

## 🚀 Next Steps

Would you like me to:
1. Create the SQL migration file?
2. Create the new Java entities?
3. Create the new API endpoints?
4. Create the new React components?
5. All of the above?

**What first?** 🎯
