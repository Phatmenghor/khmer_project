-- =====================================================
-- STOCK MANAGEMENT SYSTEM - CREATE TABLES
-- =====================================================
-- Run this script directly in PostgreSQL
-- This creates all stock management tables

-- Step 1: Check if extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: PRODUCT_STOCK - Core inventory
-- =====================================================
CREATE TABLE IF NOT EXISTS product_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_size_id UUID REFERENCES product_sizes(id) ON DELETE CASCADE,

    -- Stock Quantities
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    quantity_available INT NOT NULL DEFAULT 0,

    -- Stock Thresholds & Reorder
    minimum_stock_level INT NOT NULL DEFAULT 5,
    reorder_quantity INT NOT NULL DEFAULT 20,

    -- Pricing (Cost vs Selling)
    price_in DECIMAL(19, 4) NOT NULL DEFAULT 0.00,
    price_out DECIMAL(19, 4) NOT NULL DEFAULT 0.00,
    cost_per_unit DECIMAL(19, 4) NOT NULL DEFAULT 0.00,

    -- Dates & Tracking
    date_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_out TIMESTAMP,
    expiry_date DATE,

    -- Identifiers
    barcode VARCHAR(255) UNIQUE,
    sku VARCHAR(255),
    location VARCHAR(255),

    -- Status Flags
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_expired BOOLEAN NOT NULL DEFAULT false,
    track_inventory BOOLEAN NOT NULL DEFAULT true,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,

    -- Constraints
    CONSTRAINT product_stock_unique_variant
        UNIQUE (product_id, product_size_id, business_id),
    CONSTRAINT price_validation
        CHECK (price_in >= 0 AND price_out >= 0),
    CONSTRAINT quantity_reserved_validation
        CHECK (quantity_reserved <= (quantity_on_hand + 999))
);

-- Indices for product_stock
CREATE INDEX idx_product_stock_business_id ON product_stock(business_id);
CREATE INDEX idx_product_stock_product_id ON product_stock(product_id);
CREATE INDEX idx_product_stock_barcode ON product_stock(barcode);
CREATE INDEX idx_product_stock_is_expired ON product_stock(is_expired);
CREATE INDEX idx_product_stock_low_stock ON product_stock(quantity_on_hand);
CREATE INDEX idx_product_stock_expiry ON product_stock(expiry_date);

PRINT 'TABLE 1: product_stock created successfully';

-- =====================================================
-- TABLE 2: STOCK_MOVEMENTS - Audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

    -- Movement Details
    movement_type VARCHAR(50) NOT NULL,
    quantity_change INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,

    -- Reference Tracking
    reference_type VARCHAR(50),
    reference_id UUID,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_item_id UUID,

    -- Notes & People
    notes TEXT,
    initiated_by UUID,
    initiated_by_name VARCHAR(255),
    approved_by UUID,

    -- Financial Impact
    cost_impact DECIMAL(19, 4) DEFAULT 0.00,
    unit_price DECIMAL(19, 4) DEFAULT 0.00,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for stock_movements
CREATE INDEX idx_stock_movements_business ON stock_movements(business_id);
CREATE INDEX idx_stock_movements_product_stock ON stock_movements(product_stock_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_order ON stock_movements(order_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at DESC);

PRINT 'TABLE 2: stock_movements created successfully';

-- =====================================================
-- TABLE 3: STOCK_ADJUSTMENTS - Manual adjustments
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

    -- Adjustment Details
    adjustment_type VARCHAR(50) NOT NULL,
    previous_quantity INT NOT NULL,
    adjusted_quantity INT NOT NULL,
    quantity_difference INT NOT NULL,

    -- Approval Workflow
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    approved BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,

    -- Reason & Notes
    reason VARCHAR(255) NOT NULL,
    detail_notes TEXT,

    -- Audit
    adjusted_by UUID NOT NULL,
    adjusted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for stock_adjustments
CREATE INDEX idx_stock_adjustments_business ON stock_adjustments(business_id);
CREATE INDEX idx_stock_adjustments_product_stock ON stock_adjustments(product_stock_id);
CREATE INDEX idx_stock_adjustments_requires_approval ON stock_adjustments(requires_approval, approved);

PRINT 'TABLE 3: stock_adjustments created successfully';

-- =====================================================
-- TABLE 4: STOCK_ALERTS - Alert management
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

    -- Alert Details
    alert_type VARCHAR(50) NOT NULL,
    product_id UUID NOT NULL,
    product_size_id UUID,
    product_name VARCHAR(255),
    current_quantity INT,
    threshold INT,

    -- Expiry Info
    expiry_date DATE,
    days_until_expiry INT,

    -- Status & Handling
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,

    -- Notification Status
    notification_sent BOOLEAN NOT NULL DEFAULT false,
    notification_type VARCHAR(50) DEFAULT 'NONE',

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for stock_alerts
CREATE INDEX idx_stock_alerts_business ON stock_alerts(business_id);
CREATE INDEX idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX idx_stock_alerts_type ON stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_product_stock ON stock_alerts(product_stock_id);

PRINT 'TABLE 4: stock_alerts created successfully';

-- =====================================================
-- TABLE 5: BARCODE_MAPPINGS - Scanner support
-- =====================================================
CREATE TABLE IF NOT EXISTS barcode_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

    -- Barcode Details
    barcode VARCHAR(255) NOT NULL UNIQUE,
    barcode_format VARCHAR(50),
    barcode_image_url VARCHAR(500),

    -- Product Info (snapshot)
    product_id UUID NOT NULL,
    product_size_id UUID,
    product_name VARCHAR(255),

    -- Status
    active BOOLEAN NOT NULL DEFAULT true,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,

    CONSTRAINT barcode_unique_per_business
        UNIQUE (business_id, barcode)
);

-- Indices for barcode_mappings
CREATE INDEX idx_barcode_mappings_business ON barcode_mappings(business_id);
CREATE INDEX idx_barcode_mappings_barcode ON barcode_mappings(barcode);
CREATE INDEX idx_barcode_mappings_product_stock ON barcode_mappings(product_stock_id);

PRINT 'TABLE 5: barcode_mappings created successfully';

-- =====================================================
-- ADD COLUMNS TO EXISTING TABLES
-- =====================================================

-- Update ORDERS table
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) DEFAULT 'STOCK_NOT_CHECKED';
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS stock_notes TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS require_stock_check BOOLEAN DEFAULT true;

-- Update ORDER_ITEMS table
ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS quantity_reserved INT DEFAULT 0;
ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS quantity_fulfilled INT DEFAULT 0;
ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS stock_check_passed BOOLEAN DEFAULT false;

-- Update PRODUCTS table
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS requires_expiry BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS has_barcodes BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS default_minimum_stock INT DEFAULT 5;

-- Update PRODUCT_SIZES table
ALTER TABLE IF EXISTS product_sizes ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);
ALTER TABLE IF EXISTS product_sizes ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN;

-- Update BUSINESS_SETTINGS table
ALTER TABLE IF EXISTS business_settings ADD COLUMN IF NOT EXISTS enable_stock_tracking BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS business_settings ADD COLUMN IF NOT EXISTS stock_alert_threshold INT DEFAULT 5;
ALTER TABLE IF EXISTS business_settings ADD COLUMN IF NOT EXISTS require_stock_before_order BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS business_settings ADD COLUMN IF NOT EXISTS auto_restock_alert BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS business_settings ADD COLUMN IF NOT EXISTS barcode_enabled BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS business_settings ADD COLUMN IF NOT EXISTS stock_history_retention_days INT DEFAULT 365;

PRINT 'EXISTING TABLES UPDATED successfully';

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger 1: Update quantity_available
CREATE OR REPLACE FUNCTION update_quantity_available()
RETURNS TRIGGER AS $$
BEGIN
    NEW.quantity_available := NEW.quantity_on_hand - NEW.quantity_reserved;
    IF NEW.quantity_available < 0 THEN
        NEW.quantity_available := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_quantity_available ON product_stock;
CREATE TRIGGER trigger_update_quantity_available
BEFORE INSERT OR UPDATE ON product_stock
FOR EACH ROW
EXECUTE FUNCTION update_quantity_available();

-- Trigger 2: Check expiry status
CREATE OR REPLACE FUNCTION check_expiry_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
        NEW.is_expired := true;
    ELSE
        NEW.is_expired := false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_expiry_status ON product_stock;
CREATE TRIGGER trigger_check_expiry_status
BEFORE INSERT OR UPDATE ON product_stock
FOR EACH ROW
EXECUTE FUNCTION check_expiry_status();

-- Trigger 3: Update cost_per_unit
CREATE OR REPLACE FUNCTION update_cost_per_unit()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cost_per_unit := NEW.price_in;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cost_per_unit ON product_stock;
CREATE TRIGGER trigger_update_cost_per_unit
BEFORE INSERT OR UPDATE ON product_stock
FOR EACH ROW
EXECUTE FUNCTION update_cost_per_unit();

PRINT 'TRIGGERS CREATED successfully';

-- =====================================================
-- CREATE VIEWS FOR REPORTING
-- =====================================================

-- View 1: Stock Summary
CREATE OR REPLACE VIEW v_stock_summary AS
SELECT
    ps.business_id,
    COUNT(DISTINCT ps.id) as total_variants,
    SUM(ps.quantity_on_hand) as total_items,
    COUNT(CASE WHEN ps.quantity_on_hand <= ps.minimum_stock_level THEN 1 END) as low_stock_count,
    COUNT(CASE WHEN ps.quantity_on_hand = 0 THEN 1 END) as out_of_stock_count,
    COUNT(CASE WHEN ps.is_expired THEN 1 END) as expired_count,
    SUM(ps.quantity_on_hand * ps.price_in) as total_cost_value,
    SUM(ps.quantity_on_hand * ps.price_out) as total_retail_value
FROM product_stock ps
WHERE ps.is_active = true
GROUP BY ps.business_id;

-- View 2: Low Stock Products
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT
    ps.id,
    ps.business_id,
    ps.product_id,
    ps.product_size_id,
    p.name as product_name,
    ps.quantity_on_hand,
    ps.minimum_stock_level,
    ps.price_in,
    ps.price_out
FROM product_stock ps
JOIN products p ON ps.product_id = p.id
WHERE ps.quantity_on_hand <= ps.minimum_stock_level
    AND ps.is_active = true
    AND ps.is_expired = false;

-- View 3: Expiring Products
CREATE OR REPLACE VIEW v_expiring_products AS
SELECT
    ps.id,
    ps.business_id,
    ps.product_id,
    p.name as product_name,
    ps.expiry_date,
    (ps.expiry_date - CURRENT_DATE) as days_until_expiry,
    ps.quantity_on_hand
FROM product_stock ps
JOIN products p ON ps.product_id = p.id
WHERE ps.expiry_date IS NOT NULL
    AND ps.quantity_on_hand > 0
ORDER BY ps.expiry_date ASC;

-- View 4: Stock Valuation
CREATE OR REPLACE VIEW v_stock_valuation AS
SELECT
    ps.business_id,
    p.id as product_id,
    p.name as product_name,
    COUNT(DISTINCT ps.id) as variants,
    SUM(ps.quantity_on_hand) as total_quantity,
    SUM(ps.quantity_on_hand * ps.price_in) as cost_value,
    SUM(ps.quantity_on_hand * ps.price_out) as retail_value,
    SUM(ps.quantity_on_hand * (ps.price_out - ps.price_in)) as gross_profit
FROM product_stock ps
JOIN products p ON ps.product_id = p.id
WHERE ps.is_active = true AND ps.is_expired = false
GROUP BY ps.business_id, p.id, p.name;

PRINT 'VIEWS CREATED successfully';

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Stock Management Tables Created Successfully!' as status;

SELECT
    table_name,
    column_count
FROM (
    SELECT table_name, COUNT(*) as column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name IN ('product_stock', 'stock_movements', 'stock_adjustments', 'stock_alerts', 'barcode_mappings')
    GROUP BY table_name
) as tables
ORDER BY table_name;
