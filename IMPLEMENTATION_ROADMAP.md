# Complete Backend Implementation Roadmap
## From Current State to Production with Full Features

**Status:** Backend Core = ✅ COMPLETE | Service Layer = ✅ COMPLETE | Testing/Integration = ⏳ NEXT

---

## EXECUTIVE SUMMARY

### Current State (✅ COMPLETE)
- Feature visibility system fully implemented (11 controllers)
- Product customizations models & repositories created
- Customization service layer & mappers built
- Controllers integrated with services
- Database migrations ready (V6, V7)

### Next Steps (⏳ 6-PHASE ROADMAP)
- Phase 1: Order/Cart Integration (Week 1)
- Phase 2: Price Calculation (Week 2)
- Phase 3: Testing & Validation (Week 3-4)
- Phase 4: Frontend Integration (Weeks 5-6)
- Phase 5: Production Optimization (Week 6-7)
- Phase 6+: Advanced Features (Post-MVP)

**Total Effort:** 15-16 weeks for full stack  
**MVP Ready:** Week 4 (backend testing complete)

---

## PHASE 1: ORDER & CART INTEGRATION (Week 1)

### Objective
Extend Order and Cart models to support customization selections with proper data persistence.

### 1.1 Extend OrderItem Model
**Time:** 2-3 hours | **Complexity:** Medium

#### Files to Modify
```
menu-scanner-backend/src/main/java/com/emenu/features/order/models/OrderItem.java
```

#### Changes Required
```java
// Add these fields to OrderItem class

@Column(name = "selected_customizations", columnDefinition = "jsonb")
private String selectedCustomizationsJson;  // Stores selected customization details

@Column(name = "customization_adjustment", precision = 10, scale = 2)
private BigDecimal customizationAdjustment = BigDecimal.ZERO;

// Add getter methods
public BigDecimal getBasePrice() {
    return finalPrice.subtract(customizationAdjustment);
}

public BigDecimal getCustomizationTotal() {
    return customizationAdjustment;
}
```

#### Database Migration (V8)
```
File: menu-scanner-backend/src/main/resources/db/migration/V8__add_customizations_to_order_items.sql

ALTER TABLE order_items 
ADD COLUMN selected_customizations JSONB,
ADD COLUMN customization_adjustment NUMERIC(10, 2) DEFAULT 0;

CREATE INDEX idx_order_items_customization_adjustment ON order_items(customization_adjustment);
```

### 1.2 Extend CartItem Model
**Time:** 2-3 hours | **Complexity:** Low-Medium

#### Files to Modify
```
menu-scanner-backend/src/main/java/com/emenu/features/order/models/CartItem.java
```

#### Changes Required
```java
// Add these fields to CartItem class

@Column(name = "selected_customizations", columnDefinition = "jsonb")
private String selectedCustomizationsJson;  // Store selected customization selections

@Transient
private BigDecimal customizationAdjustment;  // Cached customization price

// Add getter
public BigDecimal getCustomizationTotal() {
    return customizationAdjustment != null ? customizationAdjustment : BigDecimal.ZERO;
}
```

#### Database Migration (V9)
```
File: menu-scanner-backend/src/main/resources/db/migration/V9__add_customizations_to_cart_items.sql

ALTER TABLE cart_items 
ADD COLUMN selected_customizations JSONB;

CREATE INDEX idx_cart_items_customizations ON cart_items(cart_id, product_id);
```

### 1.3 Create Customization Selection DTOs
**Time:** 2-3 hours | **Complexity:** Low

#### Files to Create
```
menu-scanner-backend/src/main/java/com/emenu/features/order/dto/request/OrderItemCustomizationSelectionDto.java
menu-scanner-backend/src/main/java/com/emenu/features/order/dto/request/CartItemCustomizationSelectionDto.java
menu-scanner-backend/src/main/java/com/emenu/features/order/dto/response/OrderCustomizationPricingDto.java
```

#### Key DTO Structure
```java
// OrderItemCustomizationSelectionDto
public class OrderItemCustomizationSelectionDto {
    private UUID groupId;
    private String groupName;
    private ProductCustomizationDto selectedOption;  // Single select
    private List<ProductCustomizationDto> selectedOptions;  // Multi select
}

// OrderCustomizationPricingDto
public class OrderCustomizationPricingDto {
    private UUID groupId;
    private String groupName;
    private List<CustomizationDetail> selectedCustomizations;
    private BigDecimal totalAdjustment;
}
```

### 1.4 Testing Checklist
- [ ] OrderItem model compiles with new fields
- [ ] CartItem model compiles with new fields
- [ ] Database migrations execute without errors
- [ ] Run Flyway validation
- [ ] Spring Boot application starts successfully

---

## PHASE 2: PRICE CALCULATION SERVICE (Week 2)

### Objective
Create comprehensive pricing logic for customizations with validation and calculation.

### 2.1 Create CustomizationPricingService
**Time:** 6-8 hours | **Complexity:** High

#### Files to Create
```
menu-scanner-backend/src/main/java/com/emenu/features/order/service/CustomizationPricingService.java (Interface)
menu-scanner-backend/src/main/java/com/emenu/features/order/service/impl/CustomizationPricingServiceImpl.java (Implementation)
```

#### Core Methods
```java
public interface CustomizationPricingService {
    
    // Calculate total price adjustment from selections
    BigDecimal calculateCustomizationAdjustment(
        UUID productId, 
        List<OrderItemCustomizationGroupSelectionDto> selections
    );
    
    // Validate selections against product requirements
    void validateCustomizationSelections(
        UUID productId, 
        List<OrderItemCustomizationGroupSelectionDto> selections
    );
    
    // Get customization pricing breakdown
    OrderCustomizationPricingDto getCustomizationPricingBreakdown(
        UUID productId, 
        List<OrderItemCustomizationGroupSelectionDto> selections
    );
    
    // Calculate full item price with customizations
    BigDecimal calculateItemPrice(
        UUID productId, 
        UUID productSizeId,
        Integer quantity,
        List<OrderItemCustomizationGroupSelectionDto> customizations
    );
}
```

#### Validation Rules to Implement
```
1. Required groups must have at least one selection
2. Single-select groups can only have one selected option
3. Multi-select groups can have multiple selections
4. All selected customizations must exist and be ACTIVE
5. Customizations must belong to correct group
6. Customization selections must be for correct product
```

#### Price Calculation Formula
```
itemFinalPrice = (productPrice + customizationAdjustment) × quantity

Where:
  productPrice = basePrice OR sizePrice
  customizationAdjustment = SUM(selected customization.priceAdjustment)
```

#### Example Calculation (Coffee Shop)
```
Product: Iced Latte
Base Price: $3.50
Selected:
  - Size: Large (+$1.00)
  - Extra Shot: 1 shot (+$0.50)
  - Milk: Oat milk (+$0.75)
  
customizationAdjustment = 1.00 + 0.50 + 0.75 = $2.25
itemPrice = (3.50 + 2.25) × 1 = $5.75
```

### 2.2 Update CartService
**Time:** 4-6 hours | **Complexity:** Medium

#### Files to Modify
```
menu-scanner-backend/src/main/java/com/emenu/features/order/service/impl/CartServiceImpl.java
```

#### New Methods to Add
```java
// Add cart item with customizations
public CartSummaryResponse addCartItemWithCustomizations(
    CartItemCreateRequest request,
    List<OrderItemCustomizationGroupSelectionDto> customizations
);

// Update cart item customizations
public CartSummaryResponse updateCartItemCustomizations(
    UUID cartItemId,
    List<OrderItemCustomizationGroupSelectionDto> customizations
);

// Get customization pricing for item
private OrderCustomizationPricingDto getItemCustomizationPricing(
    CartItem item,
    List<OrderItemCustomizationGroupSelectionDto> customizations
);
```

#### Implementation Logic
```java
public CartSummaryResponse addCartItemWithCustomizations(
    CartItemCreateRequest request,
    List<OrderItemCustomizationGroupSelectionDto> customizations) {
    
    // 1. Validate customizations
    customizationPricingService.validateCustomizationSelections(
        request.getProductId(), 
        customizations
    );
    
    // 2. Calculate customization adjustment
    BigDecimal adjustmentTotal = customizationPricingService
        .calculateCustomizationAdjustment(
            request.getProductId(),
            customizations
        );
    
    // 3. Create cart item
    CartItem item = new CartItem(
        request.getCartId(),
        request.getProductId(),
        request.getProductSizeId(),
        request.getQuantity()
    );
    
    // 4. Serialize customizations to JSON
    item.setSelectedCustomizationsJson(
        objectMapper.writeValueAsString(customizations)
    );
    item.setCustomizationAdjustment(adjustmentTotal);
    
    // 5. Persist
    cartItemRepository.save(item);
    
    return buildCartSummary(cart);
}
```

### 2.3 Update OrderService
**Time:** 4-6 hours | **Complexity:** Medium-High

#### Files to Modify
```
menu-scanner-backend/src/main/java/com/emenu/features/order/service/impl/OrderServiceImpl.java
```

#### Changes Required
```java
// Update method that creates OrderItem from CartItem
private OrderItem createOrderItemFromCartItem(CartItem cartItem) {
    OrderItem item = new OrderItem();
    // ... existing code ...
    
    // NEW: Handle customizations
    if (cartItem.getSelectedCustomizationsJson() != null) {
        item.setSelectedCustomizationsJson(
            cartItem.getSelectedCustomizationsJson()
        );
        
        // Parse customizations
        List<OrderItemCustomizationGroupSelectionDto> selections = 
            objectMapper.readValue(
                cartItem.getSelectedCustomizationsJson(),
                new TypeReference<List<OrderItemCustomizationGroupSelectionDto>>() {}
            );
        
        // Calculate adjustment
        BigDecimal adjustmentTotal = 
            customizationPricingService.calculateCustomizationAdjustment(
                cartItem.getProductId(),
                selections
            );
        
        item.setCustomizationAdjustment(adjustmentTotal);
        
        // Update final price
        BigDecimal customizedPrice = item.getFinalPrice()
            .add(adjustmentTotal);
        item.setFinalPrice(customizedPrice);
        item.setUnitPrice(customizedPrice.divide(
            BigDecimal.valueOf(item.getQuantity())
        ));
    }
    
    return item;
}
```

---

## PHASE 3: COMPREHENSIVE TESTING (Weeks 3-4)

### Objective
Achieve 80%+ code coverage with unit, integration, and end-to-end tests.

### 3.1 Unit Tests
**Time:** 16-20 hours | **Complexity:** Medium

#### Test Files to Create
```
menu-scanner-backend/src/test/java/com/emenu/features/main/service/ProductCustomizationServiceTest.java
menu-scanner-backend/src/test/java/com/emenu/features/order/service/CustomizationPricingServiceTest.java
menu-scanner-backend/src/test/java/com/emenu/features/main/mapper/ProductCustomizationMapperTest.java
menu-scanner-backend/src/test/java/com/emenu/features/main/mapper/ProductCustomizationGroupMapperTest.java
```

#### Test Scenarios
```
ProductCustomizationServiceTest:
  ✓ Create customization group
  ✓ Get customization group by ID
  ✓ Get product customization groups
  ✓ Update customization group
  ✓ Delete customization group
  ✓ Create customization option
  ✓ Get customization by ID
  ✓ Update customization
  ✓ Delete customization
  ✓ Group not found returns exception
  ✓ Customization not found returns exception

CustomizationPricingServiceTest:
  ✓ Calculate price for single-select group
  ✓ Calculate price for multi-select group
  ✓ Calculate price for optional group
  ✓ Calculate price for required group
  ✓ Validate required group has selection
  ✓ Validate single-select group max one selection
  ✓ Validate multi-select group allows multiple
  ✓ Validate customization exists
  ✓ Validate customization is ACTIVE
  ✓ Price calculation accuracy (multiple groups)
  ✓ Required group validation failure
  ✓ Invalid customization ID validation
```

### 3.2 Integration Tests
**Time:** 12-16 hours | **Complexity:** High

#### Test Files to Create
```
menu-scanner-backend/src/test/java/com/emenu/features/order/service/CartServiceCustomizationIT.java
menu-scanner-backend/src/test/java/com/emenu/features/order/service/OrderServiceCustomizationIT.java
menu-scanner-backend/src/test/java/com/emenu/features/main/controller/ProductCustomizationControllerIT.java
```

#### Test Scenarios
```
CartServiceCustomizationIT:
  ✓ Add cart item with customizations
  ✓ Update cart item customizations
  ✓ Calculate cart total with customizations
  ✓ Multiple cart items with different customizations
  ✓ Remove cart item with customizations
  ✓ Clear cart with customizations
  ✓ Customization JSON serialization/deserialization

OrderServiceCustomizationIT:
  ✓ Create order from cart with customizations
  ✓ Calculate order total with customizations
  ✓ Multiple items with different customizations
  ✓ Audit trail includes customization adjustments
  ✓ Order persistence saves customizations
  ✓ Retrieve order with customization details

ProductCustomizationControllerIT:
  ✓ POST /api/v1/product-customizations/groups creates group
  ✓ GET /api/v1/product-customizations/groups/product/{id} lists groups
  ✓ PUT /api/v1/product-customizations/groups/{id} updates group
  ✓ DELETE /api/v1/product-customizations/groups/{id} deletes group
  ✓ POST /api/v1/product-customizations creates option
  ✓ GET /api/v1/product-customizations/{id} retrieves option
  ✓ Public endpoints return only ACTIVE customizations
```

### 3.3 End-to-End Test Scenarios
**Time:** 8-12 hours | **Complexity:** Medium

#### Test Data Setup
```
Business: Coffee Shop Khmer
  Feature Flags: useCategories=true, useBrands=false

Product: Iced Latte ($3.50)
  Customization Groups:
    1. Size (Required, Single)
       - Small: $0.00
       - Medium: +$0.50
       - Large: +$1.00
    
    2. Extra Shots (Optional, Multiple)
       - 1 Shot: +$0.50
       - 2 Shots: +$1.00
    
    3. Milk Type (Optional, Single)
       - Regular: $0.00
       - Oat: +$0.75
       - Almond: +$0.75
```

#### Scenario 1: Coffee Shop Customer Order
```
1. Customer browses products
   GET /api/v1/public/products/latte-id
   ✓ Response includes customization groups

2. Customer adds to cart with customizations
   POST /api/v1/cart
   {
     "productId": "latte-id",
     "quantity": 1,
     "customizations": [
       {"groupId": "size", "selectedOption": {"id": "large", "priceAdjustment": 1.00}},
       {"groupId": "shots", "selectedOptions": [{"id": "shot1", "priceAdjustment": 0.50}]},
       {"groupId": "milk", "selectedOption": {"id": "oat", "priceAdjustment": 0.75}}
     ]
   }
   ✓ Cart item created with customizations
   ✓ Item price = (3.50 + 1.00 + 0.50 + 0.75) = $5.75

3. Customer checks out
   POST /api/v1/orders/checkout
   ✓ Order created with customizations
   ✓ Order total = $5.75
   ✓ Customization adjustment persisted
   ✓ Customization JSON stored

4. Verify order
   GET /api/v1/orders/{order-id}
   ✓ Response includes customization details
   ✓ Pricing breakdown shows customization adjustment
```

#### Scenario 2: Clothing Store Customer Order
```
Product: Classic Cotton T-Shirt ($19.99)
  Customization Groups:
    1. Size (Required, Single): No charge
    2. Color (Required, Single): No charge
    3. Embroidery (Optional, Single): +$5.00-$8.00

Order:
  1. Select Size: Large
  2. Select Color: Navy
  3. Select Embroidery: Custom Name (+$5.00)
  
  Final Price = 19.99 + 5.00 = $24.99
  ✓ Price calculation correct
  ✓ All customizations persisted
```

### 3.4 Test Coverage Report
**Target:** 80%+ code coverage

```
ProductCustomizationService: 95%
CustomizationPricingService: 90%
CartService (customization methods): 85%
OrderService (customization methods): 85%
ProductCustomizationMapper: 100%
ProductCustomizationGroupMapper: 100%
Controllers: 80%
```

---

## PHASE 4: FRONTEND INTEGRATION (Weeks 5-6)

### Objective
Build frontend UI for feature visibility and customizations.

### 4.1 Feature Visibility Integration
**Time:** 8-10 hours | **Complexity:** Medium

#### Files to Modify
```
menu-scanner-frontend-client/src/app/(public)/categories/page.tsx
menu-scanner-frontend-client/src/app/(public)/brands/page.tsx
menu-scanner-frontend-client/src/components/layout/navbar.tsx
menu-scanner-frontend-client/src/redux/features/business/store/slices/businessSettings.ts
```

#### Implementation
```typescript
// Redux selector for feature flags
export const selectUseCategories = (state: RootState) => 
  state.business.settings.useCategories;
export const selectUseBrands = (state: RootState) => 
  state.business.settings.useBrands;
export const selectUseSubcategories = (state: RootState) => 
  state.business.settings.useSubcategories;

// Category page component
export default function CategoriesPage() {
  const useCategories = useSelector(selectUseCategories);
  
  if (!useCategories) {
    return <div>Categories are not available for this business</div>;
  }
  
  return <CategoryList />;
}
```

### 4.2 Product Customization UI
**Time:** 20-24 hours | **Complexity:** High

#### Files to Create
```
menu-scanner-frontend-client/src/components/product/ProductCustomizationSelector.tsx
menu-scanner-frontend-client/src/components/product/CustomizationOptionCard.tsx
menu-scanner-frontend-client/src/components/product/CustomizationPriceDisplay.tsx
menu-scanner-frontend-client/src/hooks/useCustomizationPricing.ts
```

#### Component Hierarchy
```
ProductDetailPage
  ├── ProductImage
  ├── ProductInfo
  ├── ProductCustomizationSelector
  │   ├── CustomizationGroup (repeating)
  │   │   ├── CustomizationOptionCard (repeating)
  │   │   └── CustomizationValidationMessage
  │   └── PriceBreakdown
  │       ├── BasePrice
  │       ├── CustomizationAdjustment
  │       └── FinalPrice
  └── AddToCartButton
```

### 4.3 Admin Customization Management
**Time:** 16-20 hours | **Complexity:** High

#### Files to Create
```
menu-scanner-frontend-client/src/app/admin/(business)/customizations/page.tsx
menu-scanner-frontend-client/src/app/admin/(business)/customizations/[id]/page.tsx
menu-scanner-frontend-client/src/components/admin/CustomizationGroupForm.tsx
menu-scanner-frontend-client/src/components/admin/CustomizationOptionForm.tsx
menu-scanner-frontend-client/src/components/admin/CustomizationList.tsx
```

### 4.4 Feature Visibility Admin
**Time:** 8-12 hours | **Complexity:** Medium

#### Files to Modify
```
menu-scanner-frontend-client/src/app/admin/manage-business-settings/page.tsx
```

#### Implementation
```typescript
// Feature flag toggles
<FeatureFlagToggle
  label="Use Categories"
  value={settings.useCategories}
  onChange={(value) => updateSettings({ useCategories: value })}
  description="Show category filtering and browsing"
/>

<FeatureFlagToggle
  label="Use Brands"
  value={settings.useBrands}
  onChange={(value) => updateSettings({ useBrands: value })}
  description="Show brand selection in products"
/>

<FeatureFlagToggle
  label="Use Subcategories"
  value={settings.useSubcategories}
  onChange={(value) => updateSettings({ useSubcategories: value })}
  description="Show subcategory organization"
/>
```

---

## PHASE 5: PRODUCTION OPTIMIZATION (Week 6-7)

### Objective
Performance, security, and deployment readiness.

### 5.1 Performance Optimization
- [ ] Add database query indexes
- [ ] Implement customization caching
- [ ] Optimize JSONB queries
- [ ] Add response compression
- [ ] Implement pagination for large datasets

### 5.2 Security Review
- [ ] Input validation for all customizations
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (sanitize serialized JSON)
- [ ] CORS configuration
- [ ] Rate limiting for API endpoints

### 5.3 Deployment Readiness
- [ ] Environment configuration
- [ ] Database backup strategy
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment playbook
- [ ] Rollback procedures

---

## QUICK-START CHECKLIST (IMMEDIATE NEXT STEPS)

### THIS WEEK: Phase 1 - Models & DTOs
**Target Completion:** End of week (20 hours)

```
□ MONDAY (4 hours)
  □ Create database migrations (V8, V9)
  □ Extend OrderItem model with customization fields
  □ Extend CartItem model with customization fields
  □ Run Flyway validation

□ TUESDAY (4 hours)
  □ Create OrderItemCustomizationSelectionDto
  □ Create CartItemCustomizationSelectionDto  
  □ Create OrderCustomizationPricingDto
  □ Add JSON serialization support

□ WEDNESDAY (4 hours)
  □ Update CartService with customization methods
  □ Add customization calculation helpers
  □ Test CartService customization integration

□ THURSDAY (4 hours)
  □ Update OrderService with customization handling
  □ Create order from cart with customizations
  □ Test OrderService customization integration

□ FRIDAY (4 hours)
  □ Write Phase 1 unit tests
  □ Achieve 85%+ code coverage for Phase 1
  □ Fix any failing tests
  □ Code review & cleanup
```

### NEXT 2 WEEKS: Phases 2-3 - Services & Testing
```
Week 2:
  □ Implement CustomizationPricingService (40 hours)
  □ Validation logic (required, single/multi select)
  □ Price calculation logic (multiple groups)
  □ Integration with CartService and OrderService

Week 3-4:
  □ Write comprehensive unit tests (40 hours)
  □ Write integration tests (20 hours)
  □ Write end-to-end test scenarios (15 hours)
  □ Achieve 80%+ code coverage
  □ Performance profiling
  □ Security code review
```

---

## GIT COMMIT STRATEGY

```
Phase 1:
  commit: "Phase 1: Add customization support to Order/Cart models"
  Files: OrderItem, CartItem, DTOs, Migrations V8-V9

Phase 2:
  commit: "Phase 2: Implement CustomizationPricingService with validation"
  Files: CustomizationPricingService, CartService updates, OrderService updates

Phase 3:
  commit: "Phase 3: Add comprehensive test coverage (unit + integration)"
  Files: All test files, coverage reports

Phase 4:
  commit: "Phase 4: Build frontend customization UI"
  Files: React components, Redux store updates

Phase 5:
  commit: "Phase 5: Production optimization and deployment readiness"
  Files: Config, documentation, deployment scripts
```

---

## RESOURCE REQUIREMENTS

### Development Team
- 1 Backend Developer (Weeks 1-4): Service implementation, testing, optimization
- 1 Frontend Developer (Weeks 5-6): UI implementation, integration
- 1 QA Engineer (Weeks 3-7): Testing, validation, bug tracking

### Infrastructure
- PostgreSQL 12+ with JSONB support
- Spring Boot 3.0+
- Next.js 14+
- Redis (optional, for customization caching)

### Tools
- Postman (API testing)
- IntelliJ IDEA / VS Code
- Git / GitHub
- Jira / Trello (task tracking)
- Jenkins / GitHub Actions (CI/CD)

---

## SUCCESS METRICS

### By End of Week 4 (MVP Complete)
✅ All backend services implemented and tested
✅ 80%+ code coverage
✅ All customization CRUD endpoints working
✅ Price calculations accurate
✅ Database migrations successful
✅ API documentation complete

### By End of Week 6 (Frontend Complete)
✅ Feature visibility working in UI
✅ Customization selector in product pages
✅ Admin customization management UI
✅ Admin feature flag configuration
✅ E2E tests passing
✅ Performance benchmarks met

### By End of Week 7 (Production Ready)
✅ Security review completed
✅ Performance optimizations deployed
✅ Documentation complete
✅ Deployment procedures tested
✅ Staging environment validated
✅ Ready for production launch

---

## SUPPORT & DOCUMENTATION

### Available Resources
1. **COMPLETE_FEATURE_VISIBILITY_GUIDE.md** - Feature flags system
2. **PRODUCT_CUSTOMIZATIONS_GUIDE.md** - Customization architecture
3. **FULL_BACKEND_IMPLEMENTATION_REVIEW.md** - System overview
4. **This Document** - Implementation roadmap & next steps

### Communication
- Daily standup: 15 minutes (9 AM)
- Technical reviews: Wednesday & Friday
- Sprint demos: Friday afternoon
- Escalation: Slack #khmer-project channel

---

## APPENDIX A: FILE CHECKLIST

### To Create (Phase 1-2)
```
□ V8__add_customizations_to_order_items.sql
□ V9__add_customizations_to_cart_items.sql
□ OrderItemCustomizationSelectionDto.java
□ CartItemCustomizationSelectionDto.java
□ OrderCustomizationPricingDto.java
□ CustomizationPricingService.java
□ CustomizationPricingServiceImpl.java
□ ProductCustomizationServiceTest.java
□ CustomizationPricingServiceTest.java
□ CartServiceCustomizationIT.java
□ OrderServiceCustomizationIT.java
```

### To Modify (Phase 1-2)
```
□ OrderItem.java (add customization fields)
□ CartItem.java (add customization fields)
□ CartServiceImpl.java (add customization methods)
□ OrderServiceImpl.java (add customization handling)
```

### Frontend to Create (Phase 4)
```
□ ProductCustomizationSelector.tsx
□ CustomizationOptionCard.tsx
□ CustomizationPriceDisplay.tsx
□ CustomizationGroupForm.tsx (admin)
□ CustomizationOptionForm.tsx (admin)
□ useCustomizationPricing.ts (hook)
```

---

**Ready to Begin?**
Start with Phase 1 this week. All backend groundwork is complete!

Generated: 2026-04-22
Version: 1.0 - Complete Implementation Roadmap
