-- Add payment_type column to payment_options table
ALTER TABLE payment_options
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'SUBSCRIPTION';

-- Update constraint if needed
ALTER TABLE payment_options
ALTER COLUMN payment_type SET NOT NULL;
