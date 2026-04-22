# API Endpoints Reference

Complete list of 40+ endpoints with feature visibility checks.

## Categories (11 endpoints)

Protected: POST/GET/PUT/DELETE operations  
Public: List endpoints with feature checks

Each endpoint respects `useCategories` flag.

## Brands (11 endpoints)

Protected: POST/GET/PUT/DELETE operations  
Public: List endpoints with feature checks

Each endpoint respects `useBrands` flag.

## Subcategories (11 endpoints)

Protected: POST/GET/PUT/DELETE operations  
Public: List endpoints with feature checks

Each endpoint respects `useSubcategories` flag.

## Products (11 endpoints)

Protected: Browse/Admin operations  
Public: List endpoints with category/brand filtering

Filter validation respects `useCategories` and `useBrands` flags.

## Customizations (10 endpoints)

**Groups (5):**
- POST /api/v1/product-customizations/groups
- GET /api/v1/product-customizations/groups/{id}
- GET /api/v1/product-customizations/groups/product/{productId}
- PUT /api/v1/product-customizations/groups/{id}
- DELETE /api/v1/product-customizations/groups/{id}

**Options (5):**
- POST /api/v1/product-customizations
- GET /api/v1/product-customizations/{id}
- PUT /api/v1/product-customizations/{id}
- DELETE /api/v1/product-customizations/{id}
- GET /api/v1/public/product-customizations/product/{productId}

## Favorites (3 endpoints)

- POST /api/v1/product-favorites/{productId}/toggle
- POST /api/v1/product-favorites/my-favorites
- DELETE /api/v1/product-favorites/all

---

See `/docs/api/EXAMPLES.md` for request/response examples.
