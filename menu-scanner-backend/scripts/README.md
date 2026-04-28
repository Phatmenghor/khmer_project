# Test Data Generation Scripts

Complete test data for Fashion Hub - Clothing Store with ALL Features Enabled

## Quick Start

### Option 1: Using SQL Script (Recommended)

```bash
# 1. Open your PostgreSQL database client (psql, pgAdmin, etc.)
# 2. Connect to your cambodia_emenu_platform database
# 3. Run the SQL script:

psql -U postgres -d cambodia_emenu_platform -f scripts/01-generate-test-data.sql

# Or in pgAdmin:
# - Open Query Tool
# - Copy and paste contents of 01-generate-test-data.sql
# - Click Execute
```

### Option 2: Using Java DataInitializationService

```bash
# The Java script references can be integrated into DataInitializationService
# If you want to use it programmatically, see DataInitializationScript.java
```

---

## What Gets Created

### Business & User
```
Business: Fashion Hub
  ├─ Email: fashion@example.com
  ├─ Phone: +855-12-345-678
  └─ User: phatmenghor20@gmail.com (BUSINESS_OWNER)
     └─ Role: Business Owner (All features visible)
     └─ Password: Admin@123 (bcrypt)
```

### Business Settings (ALL ENABLED ✓)
```
├─ Use Categories: TRUE ✓
├─ Use Subcategories: TRUE ✓
├─ Use Brands: TRUE ✓
└─ Tax Rate: 10%
```

### Categories (3 Total)
```
1. Men
   ├─ Shirts
   ├─ Pants
   └─ Shoes

2. Women
   ├─ Dresses
   ├─ Tops
   └─ Accessories

3. Kids
```

### Brands (3 Total)
```
├─ Nike
├─ Adidas
└─ Gucci
```

### Products (3 Total)

#### 1. Classic T-Shirt (Men > Shirts > Nike)
```
Price: $25.00
Sizes:
  ├─ Small: +$0.00
  ├─ Medium: +$0.00
  ├─ Large: +$2.00
  ├─ XL: +$3.00
  └─ XXL: +$5.00

Customizations:
  ├─ Custom Color: +$3.00
  ├─ Embroidery Logo: +$2.00
  └─ Gift Wrap: +$2.00

Images: 3 (Front, Back, Detail)
```

#### 2. Athletic Polo Shirt (Men > Shirts > Adidas)
```
Price: $35.00
Sizes:
  ├─ Small: +$0.00
  ├─ Medium: +$0.00
  ├─ Large: +$2.00
  └─ XL: +$3.00

Customizations:
  ├─ Team Logo Print: +$4.00
  ├─ Name Embroidery: +$3.50
  └─ Premium Packaging: +$2.50

Images: 2 (Front, Back)
```

#### 3. Silk Evening Blouse (Women > Tops > Gucci)
```
Price: $89.00
Sizes:
  ├─ XS: +$0.00
  ├─ Small: +$0.00
  ├─ Medium: +$0.00
  └─ Large: +$5.00

Customizations:
  ├─ Custom Alteration: +$10.00
  ├─ Monogram Embroidery: +$8.00
  └─ Luxury Gift Box: +$5.00

Images: 3 (Front, Side, Detail)
```

---

## Test Scenarios

### Test 1: Browse All Products
```bash
GET /api/v1/public/products/all?businessId=550e8400-e29b-41d4-a716-446655440000
→ Returns 3 products with full hierarchy visible
```

### Test 2: Filter by Category
```bash
GET /api/v1/public/products/all?businessId=550e8400-e29b-41d4-a716-446655440000&categoryId=880e8400-e29b-41d4-a716-446655440010
→ Returns 2 Men's products (T-Shirt, Polo)
```

### Test 3: Filter by Subcategory
```bash
GET /api/v1/public/products/all?businessId=550e8400-e29b-41d4-a716-446655440000&categoryId=880e8400-e29b-41d4-a716-446655440010&subcategoryId=990e8400-e29b-41d4-a716-446655440020
→ Returns 2 Men's Shirts (T-Shirt, Polo)
```

### Test 4: Get Product Details with Customizations
```bash
GET /api/v1/products/bb0e8400-e29b-41d4-a716-446655440050
→ Returns Classic T-Shirt with:
   - 5 sizes
   - 3 customizations
   - 3 images
```

### Test 5: Get Customizations for Product
```bash
GET /api/v1/public/product-customizations/product/bb0e8400-e29b-41d4-a716-446655440050
→ Returns sorted list of 3 customizations by price
```

### Test 6: Calculate Total Price (Frontend Example)
```javascript
// Classic T-Shirt - Large with Custom Color & Gift Wrap
basePrice = $25.00
size = Large (+$2.00)
customizations = Custom Color (+$3.00) + Gift Wrap (+$2.00)
TAX = 10% = $3.20
TOTAL = $25 + $2 + $3 + $2 + $3.20 = $35.20
```

---

## Database Verification Queries

### Check if data was loaded:
```sql
-- Count products
SELECT COUNT(*) as total_products FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
→ Should return 3

-- Count customizations
SELECT COUNT(*) as total_customizations FROM product_customizations WHERE product_id IN (
  SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000'
);
→ Should return 9

-- Count sizes
SELECT COUNT(*) as total_sizes FROM product_sizes WHERE product_id IN (
  SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000'
);
→ Should return 14

-- Verify business settings
SELECT use_categories, use_subcategories, use_brands FROM business_settings 
WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
→ Should return (true, true, true)

-- Check user
SELECT * FROM users WHERE email = 'phatmenghor20@gmail.com';
```

---

## File Structure

```
scripts/
├── 01-generate-test-data.sql      ← SQL script (recommended)
├── DataInitializationScript.java   ← Java reference
└── README.md                       ← This file
```

---

## Notes

- **Password**: `Admin@123` (bcrypt hashed)
- **Dates**: All records use `NOW()` timestamp
- **IDs**: Fixed UUIDs for reproducibility in testing
- **ON CONFLICT**: SQL uses `ON CONFLICT DO NOTHING` for idempotency
- **Images**: URLs are placeholders (use your own CDN)

---

## Rollback/Reset

To clear all test data:

```sql
DELETE FROM product_customizations WHERE product_id IN (
  SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000'
);
DELETE FROM product_sizes WHERE product_id IN (
  SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000'
);
DELETE FROM product_images WHERE product_id IN (
  SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000'
);
DELETE FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM subcategories WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM brands WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM business_settings WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM users WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM businesses WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## Support

For issues or questions about the test data, check the comments in `01-generate-test-data.sql`.
