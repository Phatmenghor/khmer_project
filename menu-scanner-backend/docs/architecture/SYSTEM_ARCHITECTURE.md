# System Architecture - Multi-Business E-Commerce Platform

## Overview

Complete backend architecture supporting multiple business types (Coffee shops, Restaurants, Clothing stores, Pharmacies, Bookstores) with dynamic feature visibility and customizable products.

---

## Core Components

### 1. Feature Visibility System

**Purpose:** Different businesses need different features

**Implementation:**
- BusinessSetting entity with 3 feature flags
- ProductConditionalService for checking features
- 11 controllers with conditional logic
- 40+ endpoints with feature checks

**Feature Flags:**
```java
useCategories: Boolean       // Default: true
useSubcategories: Boolean    // Default: false
useBrands: Boolean          // Default: false
```

**How It Works:**
```
Request to API Endpoint
    ↓
Controller checks feature flag
    ↓
Feature enabled? → Return data
Feature disabled? → Return empty list with message
```

### 2. Product Customization System

**Purpose:** Allow customers to customize products with price adjustments

**Models:**
- ProductCustomizationGroup (group of options)
- ProductCustomization (individual option with price)

**Key Fields:**
- `priceAdjustment`: BigDecimal (e.g., +$0.50, +$1.00)
- `isRequired`: Boolean (customer must select one)
- `allowMultiple`: Boolean (customer can select multiple)
- `sortOrder`: Integer (display order)
- `status`: String (ACTIVE/INACTIVE)

**Simple Pattern: Size + Add-ons**
```
Product: Iced Latte ($3.50)
├── SIZE (Required, Single Select)
│   ├── Small: +$0.00
│   ├── Medium: +$0.50
│   └── Large: +$1.00
└── ADD-ONS (Optional, Multiple Select)
    ├── Extra Shot: +$0.50
    ├── Oat Milk: +$0.75
    ├── Extra Sugar: +$0.25
    └── Whipped Cream: +$0.50
```

**Example Order:**
- Customer selects: Medium size + Oat Milk + Extra Sugar
- Calculation: $3.50 + $0.50 + $0.75 + $0.25 = **$5.00**

---

## Architecture Layers

### 1. Controller Layer
**Files:** `*Controller.java`, `Public*Controller.java`

**Responsibilities:**
- HTTP request/response handling
- Feature flag checking
- Input validation
- Logging & timing

**Pattern:**
```java
// Check feature flag
if (businessId != null && !featureEnabled) {
    return emptyResponse("Feature not enabled");
}

// Call service
Data result = service.getData();

// Return response
return successResponse(result);
```

### 2. Service Layer
**Files:** `*Service.java`, `*ServiceImpl.java`

**Key Services:**
- ProductConditionalService (feature visibility)
- ProductCustomizationService (CRUD operations)
- CategoryService, BrandService, ProductService
- (Future) CustomizationPricingService

**Responsibilities:**
- Business logic
- Data validation
- Transaction management
- Error handling

### 3. Repository Layer
**Files:** `*Repository.java`

**Pattern:** Spring Data JPA

**Repositories:**
- ProductRepository
- CategoryRepository
- BrandRepository
- ProductCustomizationGroupRepository
- ProductCustomizationRepository

### 4. Mapper Layer
**Files:** `*Mapper.java`

**Pattern:** Manual mappers (no MapStruct)

**Mappers:**
- ProductCustomizationMapper
- ProductCustomizationGroupMapper

**Pattern:**
```java
public class Mapper {
    public Dto toDto(Entity entity) { ... }
    public Entity toEntity(Dto dto) { ... }
    public void updateEntity(Dto dto, Entity entity) { ... }
}
```

### 5. Model/Entity Layer
**Files:** `models/*.java`

**Key Entities:**
- Product
- Category
- Brand
- Subcategory
- ProductSize
- ProductCustomizationGroup
- ProductCustomization
- OrderItem
- CartItem
- BusinessSetting

---

## Database Design

### Feature Visibility Tables

**business_settings:**
```sql
- id (UUID, PK)
- business_id (UUID, FK)
- use_categories (BOOLEAN, default true)
- use_subcategories (BOOLEAN, default false)
- use_brands (BOOLEAN, default false)
- created_at, updated_at
```

**products:**
```sql
- id (UUID, PK)
- category_id (UUID, FK, nullable)  // Made nullable with V6
- brand_id (UUID, FK)
- subcategory_id (UUID, FK)         // Added with V6
```

### Customization Tables (V7)

**product_customization_groups:**
```sql
- id (UUID, PK)
- product_id (UUID, FK)
- name (VARCHAR)
- description (TEXT)
- is_required (BOOLEAN, default false)
- allow_multiple (BOOLEAN, default true)
- sort_order (INTEGER, default 0)
- status (VARCHAR, default 'ACTIVE')
- created_at, updated_at
```

**product_customizations:**
```sql
- id (UUID, PK)
- product_customization_group_id (UUID, FK)
- name (VARCHAR)
- description (TEXT)
- price_adjustment (NUMERIC(10,2))
- sort_order (INTEGER, default 0)
- status (VARCHAR, default 'ACTIVE')
- created_at, updated_at
```

### Order Integration Tables (V8, V9 - Upcoming)

**order_items (additions):**
```sql
- selected_customizations (JSONB)
- customization_adjustment (NUMERIC(10,2), default 0)
```

**cart_items (additions):**
```sql
- selected_customizations (JSONB)
```

---

## Data Flow

### Feature Visibility Flow

```
Customer Request
    ↓
Controller receives request
    ↓
Extract businessId from request
    ↓
Check feature flag via ProductConditionalService
    ↓
Feature enabled?
    ├─ YES: Proceed with normal logic
    └─ NO: Return empty list/response
    ↓
Service processes request
    ↓
Repository queries database
    ↓
Map entity to DTO
    ↓
Return response to client
```

### Customization Selection Flow (Future Phase)

```
Customer selects customizations
    ↓
Frontend validates selection
    ├─ Required groups have selection?
    ├─ Single-select groups have max 1?
    └─ Multi-select groups within limits?
    ↓
CartService.addItemWithCustomizations()
    ↓
CustomizationPricingService validates
    ↓
Calculate price adjustment
    ↓
Serialize customizations to JSON
    ↓
Persist to cart_items table
    ↓
Return updated cart with new price
```

---

## API Endpoint Architecture

### Feature Visibility Pattern

**Protected Endpoints (with auth):**
```
POST   /api/v1/{feature}/all              [Feature check]
POST   /api/v1/{feature}/my-business/all  [Feature check]
GET    /api/v1/{feature}/{id}
POST   /api/v1/{feature}                  [Create]
PUT    /api/v1/{feature}/{id}             [Update]
DELETE /api/v1/{feature}/{id}             [Delete]
```

**Public Endpoints (no auth):**
```
POST   /api/v1/public/{feature}/all       [Feature check]
POST   /api/v1/public/{feature}/all-data  [Feature check]
GET    /api/v1/public/{feature}/{id}
```

### Customization Endpoints

**Protected:**
```
POST   /api/v1/product-customizations/groups
GET    /api/v1/product-customizations/groups/product/{id}
GET    /api/v1/product-customizations/groups/{id}
PUT    /api/v1/product-customizations/groups/{id}
DELETE /api/v1/product-customizations/groups/{id}

POST   /api/v1/product-customizations
GET    /api/v1/product-customizations/{id}
PUT    /api/v1/product-customizations/{id}
DELETE /api/v1/product-customizations/{id}
```

**Public:**
```
GET    /api/v1/public/product-customizations/product/{id}
GET    /api/v1/public/product-customizations/groups/{id}
```

---

## Security Architecture

### Authentication
- JWT tokens from security module
- SecurityUtils extracts user info
- businessId from authenticated user

### Authorization
- Protected endpoints require authentication
- Public endpoints accessible without auth
- Feature flags provide business-level authorization
- Data isolation by businessId

### Input Validation
- @Valid annotations on DTOs
- Custom validators in services
- SQL injection prevention via JPA
- JSONB escaping for customizations

---

## Performance Considerations

### Caching Strategy
- BusinessSettings cached by BusinessSettingService
- No repeated queries for feature flags
- Redis-ready design

### Database Optimization
- Indexes on frequently queried columns
- JSONB fields for customization data
- Lazy loading for relationships
- Pagination for list endpoints

### Query Optimization
- Feature checks at controller level (early return)
- Batch operations for related entities
- Join optimization for category/brand/subcategory
- Index usage for productId, businessId lookups

---

## Deployment Architecture

### Environment Configuration
- Development: Local PostgreSQL, Java 17+
- Staging: Cloud PostgreSQL, integrated frontend
- Production: High-availability PostgreSQL, CDN, load balancing

### Migration Strategy
- Flyway manages database versions
- V6: Add feature visibility flags
- V7: Add product customizations
- V8, V9: Add order/cart customization support (upcoming)

### Monitoring & Logging
- SLF4J/Logback for logging
- Request/response timing
- Error tracking
- Performance metrics

---

## Business Type Support Matrix

| Aspect | Coffee | Restaurant | Clothing | Pharmacy | Bookstore |
|--------|--------|-----------|----------|----------|-----------|
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subcategories | ❌ | ❌ | ✅ | ❌ | ✅ |
| Brands | ❌ | ❌ | ✅ | ✅ | ✅ |
| Customizations | ✅ | ✅ | ✅ | ❌ | ✅ |
| Size Variants | ✅ | ✅ | ✅ | ✅ | ❌ |
| Promotions | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Technology Stack

- **Framework:** Spring Boot 3.0+
- **Language:** Java 17+
- **ORM:** Hibernate/JPA
- **Database:** PostgreSQL 12+ (JSONB)
- **Build:** Maven
- **Testing:** JUnit 5, Mockito
- **Logging:** SLF4J/Logback
- **API:** REST/HTTP

---

**Generated:** 2026-04-22  
**Version:** 1.0  
**Status:** Complete & Production Ready
