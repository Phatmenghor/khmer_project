# Product Customizations Guide

Comprehensive customization and add-ons system with price adjustments.

## Models

- **ProductCustomizationGroup:** Group of customization options
  - isRequired: Customer must select one
  - allowMultiple: Customer can select multiple
  
- **ProductCustomization:** Individual add-on option
  - priceAdjustment: Price change (e.g., +$0.50, +$1.00)
  - sortOrder: Display order
  - status: ACTIVE/INACTIVE

## Service Layer

**ProductCustomizationService.java**
- Full CRUD for groups & options
- Validation & error handling
- Status filtering (ACTIVE only for public)

## Controllers

- **ProductCustomizationController:** Protected (admin)
- **PublicProductCustomizationController:** Public (customer)

## Business Examples

See `/docs/examples/` for real implementations:
- Coffee Shop: Size, Shots, Milk, Sweeteners
- Clothing Store: Size, Color, Embroidery, Gift Wrap
- Restaurant: Meat Type, Sides, Sauces

## API Endpoints (10 total)

**Groups:**
- POST `/api/v1/product-customizations/groups`
- GET `/api/v1/product-customizations/groups/{id}`
- PUT `/api/v1/product-customizations/groups/{id}`
- DELETE `/api/v1/product-customizations/groups/{id}`

**Options:**
- POST `/api/v1/product-customizations`
- GET `/api/v1/product-customizations/{id}`
- PUT `/api/v1/product-customizations/{id}`
- DELETE `/api/v1/product-customizations/{id}`

## Implementation Status

✅ Models created  
✅ Service layer complete  
✅ Controllers scaffolded  
⏳ Order/Cart integration (Phase 1)  
⏳ Price calculation (Phase 2)  

---

**For complete details, see:** `/docs/README.md`
