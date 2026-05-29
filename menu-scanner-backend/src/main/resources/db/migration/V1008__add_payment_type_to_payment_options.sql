-- Add payment_type column to payment_options table
ALTER TABLE payment_options
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50);

-- Update any existing null values to default
UPDATE payment_options
SET payment_type = 'SUBSCRIPTION'
WHERE payment_type IS NULL;

-- Set NOT NULL constraint
ALTER TABLE payment_options
ALTER COLUMN payment_type SET NOT NULL;

-- Set default for future inserts
ALTER TABLE payment_options
ALTER COLUMN payment_type SET DEFAULT 'SUBSCRIPTION';
