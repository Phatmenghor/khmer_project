-- Drop payment_type column from payment_options table
ALTER TABLE payment_options
DROP COLUMN IF EXISTS payment_type;
