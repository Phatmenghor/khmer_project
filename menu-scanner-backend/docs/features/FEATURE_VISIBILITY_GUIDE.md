# Feature Visibility Control Guide

See complete documentation at `/docs/README.md`

## Quick Summary

- **useCategories:** Show/hide category browsing
- **useSubcategories:** Show/hide subcategory filtering  
- **useBrands:** Show/hide brand selection

## Implementation

All 11 controllers check feature flags before returning data:

```java
if (!productConditionalService.businessUsesCategories(businessId)) {
    return emptyResponse("Categories not enabled");
}
```

## Controllers (11 Total)

**Protected:** CategoryController, BrandController, SubcategoryController, ProductController, ProductFavoriteController

**Public:** PublicCategoryController, PublicBrandController, PublicSubcategoryController, PublicProductController

## Business Examples

- **☕ Coffee Shop:** categories=true, brands=false, subcategories=false
- **👕 Clothing:** categories=true, brands=true, subcategories=true
- **🏥 Pharmacy:** categories=true, brands=true, subcategories=false
- **🍔 Restaurant:** categories=true, brands=false, subcategories=false

## API Endpoints (11 per feature, 33 total)

Each feature has:
- POST `/api/v1/{feature}/all` [with feature check]
- POST `/api/v1/{feature}/my-business/all` [with feature check]
- GET/POST/PUT/DELETE for CRUD

## Testing

See business examples in `/docs/examples/` for complete test scenarios with pricing.

---

**For complete details, see:** `/docs/README.md` → **Feature Visibility Guide**
