-- Add image_url column to payment_options table
ALTER TABLE payment_options
ADD COLUMN IF NOT EXISTS image_url TEXT;
