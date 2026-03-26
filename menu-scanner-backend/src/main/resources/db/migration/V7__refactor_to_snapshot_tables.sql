-- Create order_delivery_addresses snapshot table
CREATE TABLE IF NOT EXISTS order_delivery_addresses (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL UNIQUE,
    village VARCHAR(255),
    commune VARCHAR(255),
    district VARCHAR(255),
    province VARCHAR(255),
    street_number VARCHAR(255),
    house_number VARCHAR(255),
    note TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_delivery_options snapshot table
CREATE TABLE IF NOT EXISTS order_delivery_options (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_id CHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255),
    description TEXT,
    image_url VARCHAR(1000),
    price NUMERIC(19, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_item_pricing_snapshots table
CREATE TABLE IF NOT EXISTS order_item_pricing_snapshots (
    id CHAR(36) NOT NULL PRIMARY KEY,
    order_item_id CHAR(36) NOT NULL UNIQUE,
    -- BEFORE Snapshot (9 fields)
    before_current_price NUMERIC(19, 2),
    before_final_price NUMERIC(19, 2),
    before_has_active_promotion BOOLEAN,
    before_discount_amount NUMERIC(19, 2),
    before_total_price NUMERIC(19, 2),
    before_promotion_type VARCHAR(50),
    before_promotion_value NUMERIC(19, 2),
    before_promotion_from_date TIMESTAMP NULL,
    before_promotion_to_date TIMESTAMP NULL,
    -- AFTER Snapshot (9 fields - NULL if no POS changes)
    after_current_price NUMERIC(19, 2),
    after_final_price NUMERIC(19, 2),
    after_has_active_promotion BOOLEAN,
    after_discount_amount NUMERIC(19, 2),
    after_total_price NUMERIC(19, 2),
    after_promotion_type VARCHAR(50),
    after_promotion_value NUMERIC(19, 2),
    after_promotion_from_date TIMESTAMP NULL,
    after_promotion_to_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    INDEX idx_order_item_id (order_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Remove old denormalized columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_village;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_commune;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_district;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_province;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_street_number;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_house_number;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_note;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_latitude;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_longitude;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_option_name;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_option_description;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_option_image_url;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_option_price;

-- Remove old denormalized columns from order_items table
ALTER TABLE order_items DROP COLUMN IF EXISTS before_current_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_final_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_has_active_promotion;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_discount_amount;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_total_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_promotion_type;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_promotion_value;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_promotion_from_date;
ALTER TABLE order_items DROP COLUMN IF EXISTS before_promotion_to_date;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_current_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_final_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_has_active_promotion;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_discount_amount;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_total_price;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_promotion_type;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_promotion_value;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_promotion_from_date;
ALTER TABLE order_items DROP COLUMN IF EXISTS after_promotion_to_date;
