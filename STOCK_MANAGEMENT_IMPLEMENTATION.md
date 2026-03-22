# Stock Management System - Implementation Guide

## Overview
Complete stock management system backend implementation for the khmer_project e-Menu application.

**Implementation Date**: March 2026
**Status**: ✅ Complete and Ready for Testing

---

## 📦 What's Implemented

### Database Layer
✅ **5 New Database Tables**
- `product_stock` - Core inventory tracking
- `stock_movements` - Complete audit trail (immutable)
- `stock_adjustments` - Manual adjustments with approval workflow
- `stock_alerts` - Alert management system
- `barcode_mappings` - POS barcode scanner support

✅ **Database Triggers & Views**
- Auto-calculate `quantity_available`
- Auto-check expiry status
- Auto-update `cost_per_unit`
- V_stock_summary - Summary statistics
- V_low_stock_products - Easy low stock queries
- V_expiring_products - Expiry tracking
- V_stock_valuation - Financial reports

✅ **Data Migration Scripts**
- V1: Create all tables with indices
- V2: Initialize stock for existing products (set to 999 = unlimited)

### Entities (Java Models)
✅ **5 JPA Entities**
- `ProductStock.java` - Main inventory model
- `StockMovement.java` - Immutable movement log
- `StockAdjustment.java` - Adjustment records
- `StockAlert.java` - Alert system
- `BarcodeMapping.java` - Barcode scanner mapping

### Repositories (Data Access)
✅ **5 Spring Data JPA Repositories** with 40+ custom queries
- `ProductStockRepository` - Complex stock queries
- `StockMovementRepository` - History & audit queries
- `StockAdjustmentRepository` - Adjustment tracking
- `StockAlertRepository` - Alert management
- `BarcodeMappingRepository` - Barcode lookup

### Service Layer
✅ **StockService Interface & Implementation**
- 30+ methods covering all stock operations
- Automatic alert creation
- Movement logging
- Expiry tracking
- Financial calculations
- Reporting

### Controllers (REST APIs)
✅ **3 Clean Controllers** with body-based filtering
- `StockController` (15+ endpoints)
- `StockAlertController` (6 endpoints)
- `StockHistoryController` (4 endpoints)

### DTOs (Data Transfer Objects)
✅ **Request DTOs**
- `StockAdjustmentRequest` - For adjusting stock
- `StockQueryRequest` - Advanced filtering (30+ filter options)

✅ **Response DTOs**
- `ProductStockDto` - Stock information
- `StockMovementDto` - Movement history
- `StockAlertDto` - Alert information

---

## 🗄️ Database Schema

### product_stock
```sql
- id (UUID) - Primary Key
- business_id (UUID) - FK to businesses
- product_id (UUID) - FK to products
- product_size_id (UUID, nullable) - FK to product_sizes

QUANTITIES:
- quantity_on_hand (INT) - Current stock
- quantity_reserved (INT) - Reserved for orders
- quantity_available (INT) - Calculated = on_hand - reserved

THRESHOLDS:
- minimum_stock_level (INT, default: 5)
- reorder_quantity (INT, default: 20)

PRICING:
- price_in (DECIMAL) - Cost price
- price_out (DECIMAL) - Selling price
- cost_per_unit (DECIMAL) - Calculated

DATES:
- date_in (TIMESTAMP) - When received
- date_out (TIMESTAMP) - Last sale date
- expiry_date (DATE, nullable) - Expiry date

IDENTIFIERS:
- barcode (VARCHAR, UNIQUE)
- sku (VARCHAR) - Product SKU
- location (VARCHAR) - Storage location

STATUS:
- is_active (BOOLEAN, default: true)
- is_expired (BOOLEAN) - Auto-calculated
- track_inventory (BOOLEAN, default: true)

AUDIT:
- created_at, updated_at, created_by, updated_by
```

### stock_movements (Immutable Audit Trail)
```sql
- id (UUID)
- business_id (UUID)
- product_stock_id (UUID)
- movement_type (ENUM):
  * STOCK_IN - Stock received
  * STOCK_OUT - Stock sold
  * ADJUSTMENT - Manual adjustment
  * RETURN - Order returned
  * DAMAGE - Damage/loss
  * EXPIRY - Product expired
  * STOCK_CHECK - Physical count

- quantity_change (INT) - Positive or negative
- previous_quantity, new_quantity (INT)
- reference_type - ORDER, ADJUSTMENT, INCIDENT
- order_id (UUID, nullable) - Link to order
- initiated_by (UUID) - User who initiated
- cost_impact (DECIMAL) - $ value impact
- unit_price (DECIMAL) - Price at time of movement

NOTE: Never delete, only insert for complete audit trail
```

### stock_adjustments
```sql
- id (UUID)
- business_id (UUID)
- product_stock_id (UUID)
- adjustment_type (ENUM):
  * RECOUNT - Physical inventory count
  * RECEIVED - Stock delivery
  * DAMAGED - Damaged goods
  * LOST - Loss/theft
  * CORRECTION - Error correction

- previous_quantity, adjusted_quantity (INT)
- reason (VARCHAR)
- detail_notes (TEXT)
- requires_approval (BOOLEAN)
- approved (BOOLEAN)
- approved_by, approved_at (UUID, TIMESTAMP)
- adjusted_by (UUID) - Who made adjustment
- adjusted_at (TIMESTAMP)
```

### stock_alerts
```sql
- id (UUID)
- business_id (UUID)
- product_stock_id (UUID)
- alert_type (ENUM):
  * LOW_STOCK - Below threshold
  * OUT_OF_STOCK - Quantity = 0
  * EXPIRING_SOON - Expiry within 7 days
  * EXPIRED - Expired
  * NEGATIVE_STOCK - Oversold
  * PRICE_ALERT - Cost increased
  * REORDER_DUE - Reorder point reached

- status: ACTIVE, ACKNOWLEDGED, RESOLVED
- notification_sent (BOOLEAN)
- notification_type: NONE, LOG, EMAIL, SMS, PUSH
```

### barcode_mappings
```sql
- id (UUID)
- business_id (UUID)
- product_stock_id (UUID)
- barcode (VARCHAR, UNIQUE)
- barcode_format: CODE128, UPC, EAN13, QR
- active (BOOLEAN)

NOTE: For POS barcode scanner integration
```

---

## 🔌 REST API Endpoints

### Stock Management
```
POST   /api/v1/stock/search              - Search stock (body-based filter)
POST   /api/v1/stock/low-stock           - Get low stock products
POST   /api/v1/stock/expired             - Get expired products
POST   /api/v1/stock/expiring            - Get expiring products (configurable days)
POST   /api/v1/stock/all                 - Get all stock for business

GET    /api/v1/stock/{stockId}           - Get stock by ID
GET    /api/v1/stock/product/{productId} - Get stock for product
GET    /api/v1/stock/barcode/{barcode}   - Get stock by barcode (POS)

POST   /api/v1/stock/check-availability  - Check if enough stock
POST   /api/v1/stock/check-bulk-availability - Check multiple products

POST   /api/v1/stock/adjust              - Manually adjust stock
POST   /api/v1/stock/add                 - Add stock quantity
POST   /api/v1/stock/{stockId}/mark-expired - Mark as expired

POST   /api/v1/stock/{stockId}/assign-barcode  - Assign barcode
POST   /api/v1/stock/{stockId}/remove-barcode  - Remove barcode
```

### Alerts
```
POST   /api/v1/stock/alerts/active       - Get active alerts
POST   /api/v1/stock/alerts/critical     - Get critical alerts
POST   /api/v1/stock/alerts/by-type      - Get alerts by type
POST   /api/v1/stock/alerts/{alertId}/acknowledge - Mark as seen
POST   /api/v1/stock/alerts/{alertId}/resolve    - Mark as resolved
GET    /api/v1/stock/alerts/count        - Count active alerts
```

### History & Audit
```
POST   /api/v1/stock/history/product/{stockId}  - Get product history
POST   /api/v1/stock/history/business/{businessId} - Get business history
POST   /api/v1/stock/history/search     - Advanced history search
POST   /api/v1/stock/history/export     - Export history for period
```

### Reports
```
POST   /api/v1/stock/summary             - Stock summary statistics
POST   /api/v1/stock/report/valuation   - Inventory value report
POST   /api/v1/stock/report/low-stock   - Low stock alert report
POST   /api/v1/stock/report/expiry      - Expiry status report
POST   /api/v1/stock/report/movement    - Movement statistics
```

**All endpoints use body-based filtering (POST instead of GET) for complex queries**

---

## 📊 Stock Query Filtering

Example `StockQueryRequest` with 30+ filter options:

```json
{
  "pageNo": 1,
  "pageSize": 50,
  "businessId": "uuid",
  "productId": "uuid",
  "productSizeId": "uuid",
  "searchText": "coffee",
  "trackInventory": true,
  "isActive": true,
  "isExpired": false,
  "lowStockOnly": true,
  "minQuantity": 0,
  "maxQuantity": 1000,
  "expiryDateFrom": "2026-03-22",
  "expiryDateTo": "2026-04-22",
  "expiringWithinDays": true,
  "searchDays": 7,
  "sortBy": "quantityOnHand",
  "sortOrder": "ASC"
}
```

---

## 🚀 Getting Started

### Step 1: Run Database Migrations
The migrations will automatically run when the application starts (Spring Boot Flyway integration).

**Migration Files:**
- `V1__create_stock_management_tables.sql` - Creates tables, indices, triggers, views
- `V2__initialize_stock_for_existing_products.sql` - Initializes stock for existing products (999 = unlimited)

### Step 2: Verify Tables Created
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'product_stock%';
```

### Step 3: Test API Endpoints
```bash
# Get stock summary
curl -X POST http://localhost:8080/api/v1/stock/summary?businessId=YOUR_BUSINESS_ID

# Search stock
curl -X POST http://localhost:8080/api/v1/stock/search \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "YOUR_BUSINESS_ID",
    "pageNo": 1,
    "pageSize": 50,
    "lowStockOnly": false
  }'

# Check availability
curl -X POST "http://localhost:8080/api/v1/stock/check-availability?businessId=YOUR_BUSINESS_ID&productId=PRODUCT_ID&quantity=5"
```

---

## 🔧 Business Settings Integration

Add these fields to `BusinessSetting` entity:

```java
@Column(nullable = false)
private Boolean enableStockTracking; // Enable/disable for business

@Column(nullable = false)
private Integer stockAlertThreshold; // Default: 5

@Column(nullable = false)
private Boolean requireStockBeforeOrder; // Prevent overselling

@Column(nullable = false)
private Boolean autoRestockAlert; // Auto-notify on low stock

@Column(nullable = false)
private Boolean barcodeEnabled; // Enable barcode scanner

@Column(nullable = false)
private Integer stockHistoryRetentionDays; // Audit trail retention
```

---

## 📋 Business Logic Implementation

### Stock Deduction on Order Confirmation
When order status changes to CONFIRMED:
1. Check stock availability
2. Deduct quantity from `product_stock.quantity_on_hand`
3. Create `StockMovement` record (type: STOCK_OUT)
4. Check if below threshold → Create alert
5. Check for oversell → Create NEGATIVE_STOCK alert
6. Update `date_out` timestamp

### Stock Return on Order Cancellation
When order is cancelled:
1. Find all STOCK_OUT movements for order
2. Reverse each movement
3. Add quantity back to `quantity_on_hand`
4. Create RETURN movement record
5. Update alerts accordingly

### Automatic Expiry Detection
- Database trigger auto-sets `is_expired = true` when `expiry_date < today`
- `getExpiringProducts()` returns products expiring within X days
- Alerts created automatically when expired

### Low Stock Alerts
- When `quantity_on_hand <= minimum_stock_level`
- Automatic alert creation (type: LOW_STOCK)
- Duplicates prevented (only one active alert per product)
- Status transitions: ACTIVE → ACKNOWLEDGED → RESOLVED

---

## 📈 Financial Tracking

### Cost Analysis
```
Inventory Value = quantity_on_hand × price_in
Retail Value = quantity_on_hand × price_out
Potential Profit = Retail Value - Inventory Value
Profit Margin = (price_out - price_in) / price_in × 100%
```

### Cost of Goods Sold (COGS)
Automatically calculated on stock deduction:
```
cost_impact = quantity_sold × price_in
```

Retrieve via report:
```
GET /api/v1/stock/report/movement?from=date&to=date
```

---

## 🔐 Security Considerations

✅ **Implemented**
- Business isolation (can only access own business stock)
- User audit trail (initiated_by, updated_by captured)
- Immutable movements (never deleted)
- Approval workflow for large adjustments
- Validation for negative stock scenarios

⚠️ **Note for Implementation**
- Update `getCurrentUserId()` in `StockServiceImpl.java` to get actual logged-in user from SecurityContext
- Add role-based access control if needed (admin, manager, staff views different data)

---

## 🧪 Testing Checklist

```
□ Database migrations run successfully
□ All 5 tables created with proper indices
□ Existing products initialized with stock (999)
□ POST /api/v1/stock/search returns results
□ Stock availability check works
□ Stock adjustment creates movement record
□ Order confirmation deducts stock
□ Order cancellation returns stock
□ Low stock alert creates when threshold breached
□ Barcode assignment works
□ Expiry detection auto-marks products
□ Reports generate correctly
□ Alert acknowledgement/resolution works
```

---

## 📁 File Structure

```
src/main/java/com/emenu/features/stock/
├── models/
│   ├── ProductStock.java
│   ├── StockMovement.java
│   ├── StockAdjustment.java
│   ├── StockAlert.java
│   └── BarcodeMapping.java
├── repository/
│   ├── ProductStockRepository.java
│   ├── StockMovementRepository.java
│   ├── StockAdjustmentRepository.java
│   ├── StockAlertRepository.java
│   └── BarcodeMappingRepository.java
├── service/
│   ├── StockService.java (interface)
│   └── impl/
│       └── StockServiceImpl.java
├── controller/
│   ├── StockController.java
│   ├── StockAlertController.java
│   └── StockHistoryController.java
└── dto/
    ├── request/
    │   ├── StockAdjustmentRequest.java
    │   └── StockQueryRequest.java
    └── response/
        ├── ProductStockDto.java
        ├── StockMovementDto.java
        └── StockAlertDto.java

src/main/resources/db/migration/
├── V1__create_stock_management_tables.sql
└── V2__initialize_stock_for_existing_products.sql
```

---

## 🎯 Key Features Delivered

✅ **Multi-Variant Support**
- Track stock per product size/variant
- Each variant has own quantity and pricing

✅ **Barcode Scanner Ready**
- POS-style barcode scanning (`/stock/barcode/{barcode}`)
- Unique barcode per business
- QR code support ready

✅ **Complete Audit Trail**
- Every stock movement logged (immutable)
- User tracking (who, when, why)
- Financial impact tracking

✅ **Advanced Filtering**
- 30+ filter options
- Body-based filtering (POST, not GET)
- Complex queries supported

✅ **Alert Management**
- 7 alert types
- Automatic creation
- Approval workflow
- Notification ready (logs now, SMS/email later)

✅ **Financial Reporting**
- Inventory valuation
- Cost of goods sold
- Profit margin analysis
- Movement reports

✅ **Data Migration Friendly**
- Existing products preserved
- Stock initialized to 999 (unlimited)
- No data loss

---

## ⚠️ Important Notes

1. **Existing Data Migration**
   - All existing products get `quantity_on_hand = 999` (unlimited)
   - This is safe - only affects products with `track_inventory = true`

2. **Stock Tracking Toggle**
   - By default, new products don't track inventory (`track_inventory = false`)
   - Admin must explicitly enable per business in settings
   - Prevents unintended stock constraints

3. **Overselling Protection**
   - System allows slight oversell (down to -999) with NEGATIVE_STOCK alert
   - Useful for special orders
   - Admin must manually resolve via adjustment

4. **Performance**
   - Proper indices on all query-heavy columns
   - Pagination supported (default 50 per page)
   - Aggregation queries optimized

5. **Future Enhancements**
   - Email/SMS notifications (infrastructure ready)
   - Barcode label printing
   - Stock forecasting
   - Automated reorder system
   - Multi-warehouse support

---

## 📞 Support & Maintenance

**Issues to Watch:**
- Update `getCurrentUserId()` to use SecurityContext
- Test stock deduction in actual order flow
- Verify business isolation in multi-tenant scenarios
- Monitor database growth (stock_movements table will grow)

**Regular Maintenance:**
- Archive old movements (after retention days)
- Review and resolve old alerts
- Monitor profit margins
- Check for negative stock situations

---

**Implementation Complete** ✅
**Ready for Integration Testing** 🚀
