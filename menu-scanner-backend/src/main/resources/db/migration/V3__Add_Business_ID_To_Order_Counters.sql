-- Add business_id column to order_counters table for per-business order number sequences
ALTER TABLE order_counters ADD COLUMN business_id UUID NOT NULL DEFAULT '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid;

-- Add foreign key constraint to businesses table
ALTER TABLE order_counters
ADD CONSTRAINT fk_order_counter_business
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- Drop old unique constraint on counter_date only
ALTER TABLE order_counters DROP CONSTRAINT uk_order_counter_date;

-- Add new unique constraint on business_id and counter_date (per-business sequence)
ALTER TABLE order_counters
ADD CONSTRAINT uk_order_counter_business_date
UNIQUE (business_id, counter_date);

-- Add index for efficient querying by business_id and counter_date
CREATE INDEX idx_order_counter_business_date ON order_counters(business_id, counter_date);

-- Add index for efficient querying by business_id
CREATE INDEX idx_order_counter_business ON order_counters(business_id);

-- Update comment to document the new counter format
COMMENT ON COLUMN order_counters.counter_value IS 'Daily counter per business: 0001 → 9999 → 10000 → 99999 → 100000 onwards (unlimited)';
