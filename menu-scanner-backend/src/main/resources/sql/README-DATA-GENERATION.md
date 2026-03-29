# Product Data Generation Scripts

This directory contains SQL scripts to populate the database with sample product and image data for testing the product listing endpoints.

## Scripts Overview

### 1. `01-insert-products-with-images.sql`
**Purpose:** Basic data generation script
**Contents:**
- Creates 10 sample products
- Generates 3-15 images for each product
- Automatically creates missing business, category, and brand records
- Uses placeholder.com for image URLs

**When to use:**
- Quick testing of image loading functionality
- Minimal database size
- Testing the basic product listing endpoint

### 2. `02-insert-extended-products-with-images.sql`
**Purpose:** Realistic sample data with variety
**Contents:**
- Creates 10 realistic products (Smartphone, Laptop, Headphones, etc.)
- Image counts:
  - Smartphone: 5 images
  - Laptop: 8 images
  - Headphones: 4 images
  - Smartwatch: 6 images
  - Tablet: 7 images
  - Camera: 10 images
  - Monitor: 5 images
  - Keyboard: 3 images
  - Mouse: 2 images (minimum)
  - Speaker: 12 images

**When to use:**
- Testing with realistic product categories
- Varied image counts for comprehensive testing
- Development and demonstration purposes

### 3. `03-insert-bulk-products-with-images.sql`
**Purpose:** Large-scale data for performance testing
**Contents:**
- Creates 50 products with different accessory names
- Image counts: randomly distributed between 2-20
- Includes random view counts and favorite counts
- Better for pagination and performance testing

**When to use:**
- Testing pagination with large datasets
- Performance testing
- Load testing the API endpoints

## How to Use in pgAdmin

### Method 1: Using Query Tool in pgAdmin

1. Open pgAdmin and navigate to your database
2. Right-click on the database → **Query Tool**
3. Copy the entire content of one of the SQL scripts
4. Paste it into the Query Tool
5. Click **Execute** (or press F5)
6. Check the **Messages** tab for confirmation

### Method 2: Using SQL Files Directly

1. Open pgAdmin and navigate to your database
2. Right-click on the database → **Query Tool**
3. Click the folder icon at the top to open a file
4. Select one of the SQL files from this directory
5. Click **Execute**

### Method 3: Using Command Line (psql)

```bash
# For basic products
psql -h localhost -U postgres -d menu_scanner_db < 01-insert-products-with-images.sql

# For extended products
psql -h localhost -U postgres -d menu_scanner_db < 02-insert-extended-products-with-images.sql

# For bulk products
psql -h localhost -U postgres -d menu_scanner_db < 03-insert-bulk-products-with-images.sql
```

## Execution Order

If running all scripts:
1. **01-insert-products-with-images.sql** (Creates initial data)
2. **02-insert-extended-products-with-images.sql** (Adds realistic products)
3. **03-insert-bulk-products-with-images.sql** (Adds performance test data)

⚠️ **Note:** You can run any script independently - they will automatically create required relationships.

## Data Validation

After running a script, verify the data was inserted correctly:

```sql
-- Check total products
SELECT COUNT(*) as total_products FROM products WHERE is_deleted = false;

-- Check products with images
SELECT
    p.id,
    p.name,
    COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_deleted = false
WHERE p.is_deleted = false
GROUP BY p.id, p.name
ORDER BY p.created_at DESC;

-- Check image statistics
SELECT
    COUNT(DISTINCT p.id) as total_products,
    MIN(image_count) as min_images,
    MAX(image_count) as max_images,
    ROUND(AVG(image_count)::NUMERIC, 2) as avg_images
FROM (
    SELECT
        p.id,
        COUNT(pi.id) as image_count
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_deleted = false
    WHERE p.is_deleted = false
    GROUP BY p.id
) stats;
```

## Image URL Format

The scripts use **placeholder.com** URLs:
```
https://via.placeholder.com/400x400?text=Product+X+Image+Y
```

Replace with your actual image hosting service:
- Change `via.placeholder.com` to your image server URL
- Customize the image dimensions (400x400)
- Update query parameters as needed

## Testing the Endpoints

After populating data, test the endpoints:

```bash
# Get all products with full details (including images)
curl -X POST http://localhost:8080/api/v1/products/admin/all \
  -H "Content-Type: application/json" \
  -d '{
    "pageNo": 1,
    "pageSize": 10,
    "search": ""
  }'

# Get POS view (same as above)
curl -X POST http://localhost:8080/api/v1/products/admin/pos/all \
  -H "Content-Type: application/json" \
  -d '{
    "pageNo": 1,
    "pageSize": 10
  }'
```

## Expected Response Format

```json
{
  "success": true,
  "message": "Found X products",
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "Product Name",
        "description": "Product description",
        "price": 99.99,
        "images": [
          {
            "id": "uuid",
            "imageUrl": "https://via.placeholder.com/400x400?text=...",
            "displayOrder": 1
          },
          {
            "id": "uuid",
            "imageUrl": "https://via.placeholder.com/400x400?text=...",
            "displayOrder": 2
          }
          // ... more images (minimum 2, maximum 20)
        ],
        "sizes": [],
        // ... other fields
      }
    ],
    "pageNo": 1,
    "pageSize": 10,
    "totalElements": 50,
    "totalPages": 5,
    "hasNext": true
  }
}
```

## Cleanup

To remove all generated data:

```sql
-- Delete all products and images
DELETE FROM product_images WHERE is_deleted = false;
DELETE FROM products WHERE is_deleted = false;

-- Optional: Delete related entities
DELETE FROM categories WHERE name IN ('Test Category', 'Electronics', 'Accessories');
DELETE FROM brands WHERE name IN ('Test Brand', 'TechBrand');
DELETE FROM businesses WHERE name IN ('Test Business', 'Default Business');
```

## Troubleshooting

### Issue: "DISTINCT required with multiple ORDER BY expressions"
**Solution:** This is handled in the script - don't modify the DISTINCT clause.

### Issue: Images not appearing in API response
**Solution:**
1. Verify the query has `LEFT JOIN FETCH p.images img`
2. Check that ProductImageMapper is properly configured
3. Ensure images are committed (not rolled back)

### Issue: Permission denied error
**Solution:** Make sure the database user has INSERT privileges on all required tables.

## Notes

- All scripts use `gen_random_uuid()` for ID generation
- Image URLs are generated dynamically - customize as needed
- All records are created with `is_deleted = false`
- Creation timestamps are automatically set to NOW()
- Products are marked as ACTIVE status by default
