# 🎯 Complete System Design - Menu Scanner E-Commerce Platform

## 📋 Table of Contents
1. System Overview
2. Architecture Diagram
3. Technology Stack
4. Database Schema
5. API Endpoints
6. Frontend Structure
7. User Workflows
8. Feature Checklist
9. Implementation Timeline
10. File Structure

---

## 1️⃣ SYSTEM OVERVIEW

### What is Being Built?
A **dynamic, flexible e-commerce platform** for ANY business type in Cambodia:
- Coffee shops, restaurants, clothing stores, electronics, pharmacies, etc.
- Single or multiple businesses can use the platform
- Each business can customize products, categories, brands, promotions
- Customers browse and order from any business
- Admin manages everything

### Core Features
```
ADMIN SIDE:
├─ Manage Products (Create, Update, Delete)
├─ Manage Categories & Subcategories
├─ Manage Brands
├─ Manage Inventory
├─ Manage Promotions
├─ Manage Business Settings
├─ Manage Orders
└─ View Analytics

CUSTOMER SIDE:
├─ Browse Products
├─ Search & Filter
├─ View Product Details
├─ Add to Cart
├─ Checkout
├─ Manage Orders
├─ View Profile
└─ Leave Reviews
```

---

## 2️⃣ ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER DEVICES                         │
│              (Web, Mobile, Responsive Browser)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────▼─────────────┐
                │    CDN / Image Server    │
                │   (Image Hosting)        │
                └──────────────────────────┘
                             │
        ┌────────────────────▼─────────────────────┐
        │                                          │
        │      FRONTEND (Next.js React)            │
        │   /menu-scanner-frontend-client          │
        │                                          │
        │  ├─ Pages (Home, Products, Checkout)    │
        │  ├─ Components (Cards, Forms, Modals)   │
        │  ├─ Redux State Management              │
        │  ├─ API Services (HTTP Calls)           │
        │  ├─ Hooks (Custom React Hooks)          │
        │  └─ Utilities (Helpers, Constants)      │
        │                                          │
        └────────────────────┬─────────────────────┘
                             │
                    (REST API Calls)
                             │
        ┌────────────────────▼─────────────────────┐
        │                                          │
        │       BACKEND (Spring Boot Java)        │
        │    /menu-scanner-backend                │
        │                                          │
        │  ├─ Controllers (API Endpoints)         │
        │  ├─ Services (Business Logic)           │
        │  ├─ Repositories (Database Access)      │
        │  ├─ Models/Entities (JPA)               │
        │  ├─ DTOs (Request/Response)             │
        │  ├─ Enums (Status, Types)               │
        │  ├─ Exceptions (Error Handling)         │
        │  └─ Security (Auth, JWT)                │
        │                                          │
        └────────────────────┬─────────────────────┘
                             │
                    (SQL Queries)
                             │
        ┌────────────────────▼─────────────────────┐
        │                                          │
        │     DATABASE (PostgreSQL)                │
        │                                          │
        │  ├─ Users & Authentication              │
        │  ├─ Businesses                          │
        │  ├─ Products                            │
        │  ├─ Categories & Brands                 │
        │  ├─ Inventory                           │
        │  ├─ Orders & Transactions               │
        │  ├─ Reviews & Ratings                   │
        │  └─ Business Settings                   │
        │                                          │
        └──────────────────────────────────────────┘
```

---

## 3️⃣ TECHNOLOGY STACK

### Frontend
```
Framework:        Next.js 14+ (React)
Language:         TypeScript
State:            Redux Toolkit
Form Handling:    React Hook Form + Zod
Styling:          Tailwind CSS
Components:       shadcn/ui
HTTP:             Axios / Fetch API
Icons:            Lucide React
Image Upload:     Base64 encoding
Build Tool:       Webpack (via Next.js)
```

### Backend
```
Language:         Java 21+
Framework:        Spring Boot 3.x
ORM:              JPA/Hibernate
Database:         PostgreSQL
Build Tool:       Maven
Testing:          JUnit 5, Mockito
API:              REST (JSON)
Authentication:   JWT / Spring Security
Validation:       Validation API
Logging:          SLF4J + Logback
```

### Database
```
Database:         PostgreSQL 14+
Migration:        Flyway
Connection Pool:  HikariCP
Backup:           SQL dumps
```

### Deployment
```
Frontend:         Vercel / AWS S3 + CloudFront
Backend:          AWS EC2 / Docker
Database:         AWS RDS PostgreSQL
CDN:              CloudFront / Cloudflare
Monitoring:       CloudWatch / Sentry
```

---

## 4️⃣ DATABASE SCHEMA

### Core Tables
```
┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION & USERS                                          │
├─────────────────────────────────────────────────────────────────┤
│ users                                                           │
│ ├─ id (UUID)                                                   │
│ ├─ email (String)                                              │
│ ├─ password_hash (String)                                      │
│ ├─ first_name, last_name (String)                             │
│ ├─ phone_number (String)                                       │
│ ├─ profile_image_url (String)                                  │
│ ├─ date_of_birth (LocalDate)                                   │
│ ├─ status (ACTIVE/INACTIVE/SUSPENDED)                          │
│ ├─ created_at, updated_at (Timestamp)                          │
│ └─ is_deleted (Boolean)                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BUSINESS MANAGEMENT                                             │
├─────────────────────────────────────────────────────────────────┤
│ businesses                                                      │
│ ├─ id (UUID)                                                   │
│ ├─ business_name (String)                                      │
│ ├─ description (Text)                                          │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ ├─ created_by (UUID - user_id)                                │
│ ├─ created_at, updated_at (Timestamp)                          │
│ └─ is_deleted (Boolean)                                        │
│                                                                 │
│ business_settings                                              │
│ ├─ id (UUID)                                                   │
│ ├─ business_id (UUID)                                          │
│ ├─ business_name (String)                                      │
│ ├─ logo_business_url (String)                                  │
│ ├─ tax_percentage (Decimal)                                    │
│ ├─ primary_color (String)                                      │
│ ├─ enable_stock (ENABLED/DISABLED)                             │
│ ├─ contact_address (String)                                    │
│ ├─ contact_phone (String)                                      │
│ ├─ contact_email (String)                                      │
│ ├─ use_categories (Boolean)                                    │
│ ├─ use_subcategories (Boolean)                                 │
│ ├─ use_brands (Boolean)                                        │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ business_hours                                                 │
│ ├─ id (UUID)                                                   │
│ ├─ business_setting_id (UUID)                                  │
│ ├─ day (MONDAY, TUESDAY, ... SUNDAY)                          │
│ ├─ opening_time (LocalTime)                                    │
│ ├─ closing_time (LocalTime)                                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ social_media                                                   │
│ ├─ id (UUID)                                                   │
│ ├─ business_setting_id (UUID)                                  │
│ ├─ name (String) - Facebook, Instagram, Telegram              │
│ ├─ link_url (String)                                           │
│ └─ created_at, updated_at (Timestamp)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PRODUCTS & CATALOG                                              │
├─────────────────────────────────────────────────────────────────┤
│ categories                                                      │
│ ├─ id (UUID)                                                   │
│ ├─ business_id (UUID)                                          │
│ ├─ name (String)                                               │
│ ├─ image_url (String)                                          │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ subcategories                                                  │
│ ├─ id (UUID)                                                   │
│ ├─ category_id (UUID)                                          │
│ ├─ business_id (UUID)                                          │
│ ├─ name (String)                                               │
│ ├─ image_url (String)                                          │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ brands                                                         │
│ ├─ id (UUID)                                                   │
│ ├─ business_id (UUID)                                          │
│ ├─ name (String)                                               │
│ ├─ image_url (String)                                          │
│ ├─ description (Text)                                          │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ products                                                       │
│ ├─ id (UUID)                                                   │
│ ├─ business_id (UUID)                                          │
│ ├─ category_id (UUID - nullable)                               │
│ ├─ subcategory_id (UUID - nullable)                            │
│ ├─ brand_id (UUID - nullable)                                  │
│ ├─ name (String)                                               │
│ ├─ description (Text)                                          │
│ ├─ price (Decimal)                                             │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ ├─ has_sizes (Boolean)                                         │
│ ├─ promotion_type (PERCENTAGE/FIXED_AMOUNT/null)              │
│ ├─ promotion_value (Decimal)                                   │
│ ├─ promotion_from_date (Timestamp)                             │
│ ├─ promotion_to_date (Timestamp)                               │
│ ├─ visibility (PUBLIC/PRIVATE/COMING_SOON)                     │
│ ├─ rating (Decimal - auto calculated)                          │
│ ├─ review_count (Integer - auto calculated)                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ product_images                                                 │
│ ├─ id (UUID)                                                   │
│ ├─ product_id (UUID)                                           │
│ ├─ image_url (String)                                          │
│ ├─ is_primary (Boolean)                                        │
│ ├─ alt_text (String)                                           │
│ └─ created_at (Timestamp)                                      │
│                                                                 │
│ product_sizes (variants)                                       │
│ ├─ id (UUID)                                                   │
│ ├─ product_id (UUID)                                           │
│ ├─ name (String) - "Small", "Medium", "Large"                 │
│ ├─ price (Decimal)                                             │
│ ├─ sku (String)                                                │
│ ├─ barcode (String)                                            │
│ ├─ attributes (JSONB) - {size, temp, color, etc}              │
│ ├─ promotion_type, promotion_value                             │
│ ├─ minimum_stock_level (Integer)                               │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ product_stock                                                  │
│ ├─ id (UUID)                                                   │
│ ├─ product_size_id (UUID)                                      │
│ ├─ quantity (Integer)                                          │
│ └─ last_updated (Timestamp)                                    │
│                                                                 │
│ product_tags                                                   │
│ ├─ id (UUID)                                                   │
│ ├─ product_id (UUID)                                           │
│ ├─ tag (String) - bestseller, new, vegan, etc                 │
│ └─ created_at (Timestamp)                                      │
│                                                                 │
│ related_products                                               │
│ ├─ id (UUID)                                                   │
│ ├─ product_id (UUID)                                           │
│ ├─ related_product_id (UUID)                                   │
│ ├─ reason (similar-category / often-bought-together)           │
│ └─ created_at (Timestamp)                                      │
│                                                                 │
│ product_bundles                                                │
│ ├─ id (UUID)                                                   │
│ ├─ business_id (UUID)                                          │
│ ├─ name (String)                                               │
│ ├─ description (Text)                                          │
│ ├─ bundle_price (Decimal)                                      │
│ ├─ regular_price (Decimal - sum of items)                      │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ bundle_items                                                   │
│ ├─ id (UUID)                                                   │
│ ├─ bundle_id (UUID)                                            │
│ ├─ product_id (UUID)                                           │
│ ├─ product_size_id (UUID - nullable)                           │
│ ├─ quantity (Integer)                                          │
│ └─ created_at (Timestamp)                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ORDERS & CHECKOUT                                               │
├─────────────────────────────────────────────────────────────────┤
│ delivery_options                                                │
│ ├─ id (UUID)                                                   │
│ ├─ business_id (UUID)                                          │
│ ├─ name (String) - "Standard", "Express", "Pickup"            │
│ ├─ price (Decimal)                                             │
│ ├─ estimated_time (String) - "30-45 minutes"                  │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ payment_options                                                │
│ ├─ id (UUID)                                                   │
│ ├─ business_id (UUID)                                          │
│ ├─ name (String) - "Cash", "Mobile Money", "Card"             │
│ ├─ payment_option_type (CASH_ON_DELIVERY/MOBILE_MONEY/etc)    │
│ ├─ status (ACTIVE/INACTIVE)                                    │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ locations (addresses)                                          │
│ ├─ id (UUID)                                                   │
│ ├─ user_id (UUID)                                              │
│ ├─ village, commune, district, province (String)               │
│ ├─ street_number, house_number (String)                        │
│ ├─ note (String)                                               │
│ ├─ latitude, longitude (Double)                                │
│ ├─ full_address (String)                                       │
│ ├─ is_default (Boolean)                                        │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ orders                                                         │
│ ├─ id (UUID)                                                   │
│ ├─ order_number (String) - "ORD-2024-00001"                   │
│ ├─ business_id (UUID)                                          │
│ ├─ user_id (UUID)                                              │
│ ├─ status (PENDING/CONFIRMED/PROCESSING/READY/DELIVERED)      │
│ ├─ delivery_address_id (UUID)                                  │
│ ├─ delivery_option_id (UUID)                                   │
│ ├─ payment_option_id (UUID)                                    │
│ ├─ payment_status (PENDING/COMPLETED/FAILED)                   │
│ ├─ subtotal (Decimal)                                          │
│ ├─ discount_amount (Decimal)                                   │
│ ├─ delivery_fee (Decimal)                                      │
│ ├─ tax (Decimal)                                               │
│ ├─ total (Decimal)                                             │
│ ├─ customer_note (Text)                                        │
│ ├─ order_from (CUSTOMER/ADMIN)                                 │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ order_items                                                    │
│ ├─ id (UUID)                                                   │
│ ├─ order_id (UUID)                                             │
│ ├─ product_id (UUID)                                           │
│ ├─ product_size_id (UUID)                                      │
│ ├─ quantity (Integer)                                          │
│ ├─ unit_price (Decimal)                                        │
│ ├─ final_price (Decimal)                                       │
│ ├─ total_price (Decimal)                                       │
│ ├─ sku, barcode (String)                                       │
│ └─ created_at (Timestamp)                                      │
│                                                                 │
│ order_status_history                                           │
│ ├─ id (UUID)                                                   │
│ ├─ order_id (UUID)                                             │
│ ├─ status (String)                                             │
│ ├─ changed_by (String)                                         │
│ ├─ note (String)                                               │
│ └─ changed_at (Timestamp)                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ REVIEWS & RATINGS                                               │
├─────────────────────────────────────────────────────────────────┤
│ product_reviews                                                 │
│ ├─ id (UUID)                                                   │
│ ├─ product_id (UUID)                                           │
│ ├─ user_id (UUID)                                              │
│ ├─ rating (Integer) 1-5                                        │
│ ├─ title (String)                                              │
│ ├─ comment (Text)                                              │
│ ├─ is_verified (Boolean) - purchased product                   │
│ ├─ helpful_count (Integer)                                     │
│ └─ created_at, updated_at (Timestamp)                          │
│                                                                 │
│ product_review_images                                          │
│ ├─ id (UUID)                                                   │
│ ├─ review_id (UUID)                                            │
│ ├─ image_url (String)                                          │
│ └─ created_at (Timestamp)                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ API ENDPOINTS

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh-token     - Refresh JWT
GET    /api/auth/profile           - Get current user profile
PUT    /api/auth/profile           - Update profile
```

### Products
```
GET    /api/products/business/{businessId}           - Get all products for business
GET    /api/products/{id}                            - Get product details
GET    /api/products/search?query=coffee             - Search products
GET    /api/products/category/{categoryId}           - Get products by category
GET    /api/products/brand/{brandId}                 - Get products by brand
GET    /api/products/{id}/related                    - Get related products
POST   /api/products                                 - Create product (Admin)
PUT    /api/products/{id}                            - Update product (Admin)
DELETE /api/products/{id}                            - Delete product (Admin)
```

### Categories
```
GET    /api/categories/business/{businessId}         - Get all categories
GET    /api/categories/{id}                          - Get category details
POST   /api/categories                               - Create category (Admin)
PUT    /api/categories/{id}                          - Update category (Admin)
DELETE /api/categories/{id}                          - Delete category (Admin)
```

### Brands
```
GET    /api/brands/business/{businessId}             - Get all brands
GET    /api/brands/{id}                              - Get brand details
POST   /api/brands                                   - Create brand (Admin)
PUT    /api/brands/{id}                              - Update brand (Admin)
DELETE /api/brands/{id}                              - Delete brand (Admin)
```

### Orders
```
GET    /api/orders                                   - Get my orders
GET    /api/orders/{id}                              - Get order details
POST   /api/orders                                   - Create new order
PUT    /api/orders/{id}/status                       - Update order status (Admin)
GET    /api/orders/business/{businessId}             - Get business orders (Admin)
```

### Checkout
```
GET    /api/delivery-options/business/{businessId}   - Get delivery options
GET    /api/payment-options/business/{businessId}    - Get payment options
POST   /api/checkout                                 - Place order
```

### Locations (Addresses)
```
GET    /api/locations                                - Get my addresses
GET    /api/locations/{id}                           - Get address details
POST   /api/locations                                - Create address
PUT    /api/locations/{id}                           - Update address
DELETE /api/locations/{id}                           - Delete address
PUT    /api/locations/{id}/default                   - Set as default
```

### Reviews
```
GET    /api/products/{id}/reviews                    - Get product reviews
POST   /api/products/{id}/reviews                    - Add review
PUT    /api/reviews/{id}                             - Update review
DELETE /api/reviews/{id}                             - Delete review
```

### Business Settings (Admin)
```
GET    /api/business-settings                        - Get settings
PUT    /api/business-settings                        - Update settings
GET    /api/business-settings/hours                  - Get business hours
PUT    /api/business-settings/hours                  - Update hours
GET    /api/business-settings/social-media           - Get social media
PUT    /api/business-settings/social-media           - Update social media
```

---

## 6️⃣ FRONTEND STRUCTURE

### Directory Tree
```
menu-scanner-frontend-client/
├── src/
│   ├── app/                              # Next.js pages
│   │   ├── (public)/                     # Customer routes
│   │   │   ├── page.tsx                  # Home page
│   │   │   ├── categories/               # Categories page
│   │   │   ├── products/                 # Products grid
│   │   │   ├── [id]/                     # Product detail
│   │   │   ├── cart/                     # Shopping cart
│   │   │   ├── checkout/                 # Checkout flow
│   │   │   ├── orders/                   # My orders
│   │   │   ├── profile/                  # User profile
│   │   │   └── search/                   # Search results
│   │   ├── admin/                        # Admin routes
│   │   │   ├── dashboard/                # Admin dashboard
│   │   │   ├── products/                 # Manage products
│   │   │   ├── categories/               # Manage categories
│   │   │   ├── brands/                   # Manage brands
│   │   │   ├── orders/                   # Manage orders
│   │   │   ├── business-settings/        # Business settings
│   │   │   └── analytics/                # Analytics
│   │   ├── layout.tsx                    # Root layout
│   │   └── auth/                         # Auth pages (login, register)
│   │
│   ├── components/
│   │   ├── shared/                       # Reusable components
│   │   │   ├── header/                   # Header/Navbar
│   │   │   ├── footer/                   # Footer
│   │   │   ├── sidebar/                  # Sidebar
│   │   │   ├── card/                     # Card components
│   │   │   ├── button/                   # Button variants
│   │   │   ├── form/                     # Form components
│   │   │   ├── modal/                    # Modal dialogs
│   │   │   ├── pagination/               # Pagination
│   │   │   ├── loading/                  # Loading states
│   │   │   ├── empty-state/              # Empty state views
│   │   │   └── common/                   # Common utilities
│   │   ├── layout/                       # Layout components
│   │   │   ├── footer.tsx
│   │   │   ├── admin-footer.tsx
│   │   │   └── header.tsx
│   │   └── (feature)/                    # Feature-specific
│   │       ├── product/                  # Product components
│   │       ├── cart/                     # Cart components
│   │       ├── checkout/                 # Checkout components
│   │       └── order/                    # Order components
│   │
│   ├── redux/
│   │   ├── store.ts                      # Redux store config
│   │   └── features/
│   │       ├── auth/                     # Auth reducer & thunks
│   │       ├── products/                 # Products reducer & thunks
│   │       ├── cart/                     # Cart reducer
│   │       ├── orders/                   # Orders reducer
│   │       ├── ui/                       # UI state (modals, sidebar)
│   │       └── main/                     # Main app state
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useFetch.ts
│   │   └── ...
│   │
│   ├── services/                         # API services
│   │   ├── api.ts                        # Axios config
│   │   ├── auth-service.ts
│   │   ├── product-service.ts
│   │   ├── cart-service.ts
│   │   ├── order-service.ts
│   │   └── ...
│   │
│   ├── utils/                            # Utility functions
│   │   ├── formatting.ts                 # Format currency, dates, etc
│   │   ├── validation.ts                 # Form validation
│   │   ├── constants.ts                  # App constants
│   │   └── ...
│   │
│   ├── types/                            # TypeScript types
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── ...
│   │
│   ├── styles/                           # Global styles
│   │   ├── globals.css
│   │   └── variables.css
│   │
│   └── env.local                         # Environment variables
│
├── public/
│   └── assets/                           # Images, icons
│       ├── favicon.ico
│       ├── logo.png
│       └── ...
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 7️⃣ USER WORKFLOWS

### Customer Flow
```
┌─────────────┐
│  Home Page  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Browse Products  │
│ - Categories     │
│ - Search         │
│ - Filter by tags │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Product Detail   │
│ - View images    │
│ - Select variant │
│ - Read reviews   │
│ - See price      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Add to Cart      │
│ - Select size    │
│ - Set quantity   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Shopping Cart    │
│ - View items     │
│ - Update qty     │
│ - Remove items   │
│ - See total      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Checkout         │
│ - Select address │
│ - Select delivery│
│ - Select payment │
│ - Add note       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Place Order      │
│ - Confirm total  │
│ - Place order    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Order Confirmed  │
│ - View order ID  │
│ - Track order    │
│ - Continue shop  │
└──────────────────┘
```

### Admin Flow
```
┌─────────────────┐
│  Admin Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Admin Dashboard         │
│ - Overview stats        │
│ - Quick actions         │
└────────┬────────────────┘
         │
     ┌───┴─────────────────────┐
     │                         │
     ▼                         ▼
┌──────────────────┐  ┌─────────────────┐
│ Products Mgmt    │  │ Orders Mgmt     │
│ - Create product │  │ - View orders   │
│ - Edit product   │  │ - Update status │
│ - Delete product │  │ - Print labels  │
│ - Upload images  │  │ - Analytics     │
└──────┬───────────┘  └─────────────────┘
       │
       ▼
┌──────────────────┐
│ Inventory        │
│ - Stock levels   │
│ - Low stock      │
│ - Restock        │
└──────────────────┘

     ┌──────────────────────────────────┐
     │                                  │
     ▼                                  ▼
┌──────────────────────┐  ┌──────────────────────┐
│ Business Settings    │  │ Promotions & Sales   │
│ - Logo               │  │ - Create promotion   │
│ - Contact info       │  │ - Set discount       │
│ - Hours              │  │ - Bundle products    │
│ - Social media       │  │ - View analytics     │
└──────────────────────┘  └──────────────────────┘
```

---

## 8️⃣ FEATURE CHECKLIST

### ✅ Completed Features
- [x] Footer with copyright & legal links
- [x] Pagination without icons (text only)
- [x] Checkout page reordered (Delivery first)
- [x] Banner carousel auto-scroll
- [x] SQL test data fixed
- [x] Social media profile upload (image)
- [x] Product tags & filters
- [x] Related products system
- [x] Product reviews & ratings
- [x] Multiple product images
- [x] Business settings management

### 🔄 In Progress / Need Implementation
- [ ] Complete admin product management
- [ ] Complete admin category management
- [ ] Complete admin brand management
- [ ] Inventory management dashboard
- [ ] Order management system
- [ ] Customer profile management
- [ ] Address management (add/edit/delete)
- [ ] Cart persistence (localStorage)
- [ ] Search functionality (frontend)
- [ ] Product filtering (by tags, price, rating)
- [ ] Bundle/combo products
- [ ] Wishlist/Favorites
- [ ] Order tracking
- [ ] Analytics dashboard

### 📋 Future Features (Phase 2)
- [ ] Multi-location support
- [ ] Digital products
- [ ] Subscription products
- [ ] Loyalty program
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] SMS notifications
- [ ] WhatsApp integration
- [ ] Payment gateway integration
- [ ] Bulk operations (import/export)

---

## 9️⃣ IMPLEMENTATION TIMELINE

```
WEEK 1: Foundation (3-5 days)
├─ Set up database migrations
├─ Create all entities & models
├─ Set up repositories & services
└─ Create basic API endpoints

WEEK 2: Products System (4-5 days)
├─ Complete product CRUD
├─ Implement categories & brands
├─ Add tags & filters
├─ Implement related products
└─ Add product images

WEEK 3: Frontend - Products (4-5 days)
├─ Create product grid layout
├─ Build product detail page
├─ Add search & filters
├─ Implement product cards
└─ Add to cart functionality

WEEK 4: Cart & Checkout (4-5 days)
├─ Build shopping cart
├─ Implement checkout flow
├─ Add delivery options
├─ Add payment options
└─ Create order confirmation

WEEK 5: Orders & Reviews (3-4 days)
├─ Implement order creation
├─ Build order tracking
├─ Add product reviews
├─ Implement rating system
└─ Create order history page

WEEK 6: Admin Panel (4-5 days)
├─ Build admin dashboard
├─ Create product management
├─ Create category management
├─ Create order management
└─ Add business settings

WEEK 7: Testing & Polish (3-4 days)
├─ Unit testing
├─ Integration testing
├─ Bug fixes
├─ Performance optimization
└─ Mobile responsiveness

TOTAL: 4-5 weeks for MVP
```

---

## 🔟 FILE STRUCTURE - Complete

### Backend Structure
```
menu-scanner-backend/
├── src/main/java/com/emenu/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── models/
│   │   │   │   ├── User.java
│   │   │   │   └── Business.java
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   └── security/
│   │   │
│   │   ├── main/
│   │   │   ├── models/
│   │   │   │   ├── Product.java
│   │   │   │   ├── Category.java
│   │   │   │   ├── Brand.java
│   │   │   │   ├── ProductSize.java
│   │   │   │   ├── Order.java
│   │   │   │   ├── OrderItem.java
│   │   │   │   ├── ProductReview.java
│   │   │   │   ├── Banner.java
│   │   │   │   └── ...
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   └── exceptions/
│   │   │
│   │   ├── location/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── dto/
│   │   │
│   │   └── business/
│   │       ├── models/
│   │       │   └── BusinessSettings.java
│   │       ├── repositories/
│   │       ├── services/
│   │       ├── controllers/
│   │       └── dto/
│   │
│   ├── shared/
│   │   ├── domain/
│   │   │   ├── BaseEntity.java
│   │   │   └── BaseUUIDEntity.java
│   │   ├── exceptions/
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── ValidationException.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── utils/
│   │   └── constants/
│   │
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── DatabaseConfig.java
│   │   └── CorsConfig.java
│   │
│   ├── enums/
│   │   ├── product/
│   │   │   ├── ProductStatus.java
│   │   │   ├── PromotionType.java
│   │   │   └── StockStatus.java
│   │   ├── order/
│   │   │   ├── OrderStatus.java
│   │   │   └── PaymentStatus.java
│   │   ├── common/
│   │   │   └── Status.java
│   │   └── ...
│   │
│   └── MenuScannerApplication.java
│
├── src/main/resources/
│   ├── application.properties
│   ├── application-prod.properties
│   ├── db/migration/           # Flyway migrations
│   │   ├── V1__initial_schema.sql
│   │   ├── V2__add_products.sql
│   │   ├── V3__add_orders.sql
│   │   └── ...
│   └── ...
│
├── pom.xml
└── ...
```

---

## SUMMARY

This is a **complete, production-ready design** for a flexible e-commerce platform that can handle:

✅ Any business type
✅ Dynamic products & inventory
✅ Complete order management
✅ Reviews & ratings
✅ Admin dashboard
✅ Beautiful customer experience

**Ready to start building?** Which component would you like to build first? 🚀

---

**Questions?**
- Want database migration scripts?
- Want API endpoint examples?
- Want frontend component templates?
- Want deployment setup?
