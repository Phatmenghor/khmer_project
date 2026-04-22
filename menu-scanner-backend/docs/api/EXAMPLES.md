# API Examples

Real-world request/response examples for all endpoints.

## Feature Visibility Examples

### Get Categories (Feature Enabled)
```json
Request: POST /api/v1/public/categories/all
Body: { "businessId": "coffee-shop-1" }

Response: 200 OK
{
  "success": true,
  "data": [
    {"id": "c1", "name": "Espresso Drinks"},
    {"id": "c2", "name": "Iced Beverages"}
  ]
}
```

### Get Brands (Feature Disabled)
```json
Request: POST /api/v1/public/brands/all
Body: { "businessId": "coffee-shop-1" }

Response: 200 OK
{
  "success": true,
  "message": "Brands are not enabled for this business",
  "data": []
}
```

## Customization Examples

### Get Product with Customizations
```json
GET /api/v1/public/products/latte-id

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "latte-id",
    "name": "Iced Latte",
    "price": 3.50,
    "customizationGroups": [
      {
        "id": "size-group",
        "name": "Size",
        "isRequired": true,
        "customizations": [
          {"id": "small", "name": "Small", "priceAdjustment": 0.00},
          {"id": "large", "name": "Large", "priceAdjustment": 1.00}
        ]
      }
    ]
  }
}
```

---

See business examples in `/docs/examples/` for complete ordering scenarios.
