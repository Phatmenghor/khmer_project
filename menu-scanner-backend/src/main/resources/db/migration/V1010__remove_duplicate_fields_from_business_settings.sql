-- Remove duplicate fields from business_settings table
ALTER TABLE business_settings
DROP COLUMN IF EXISTS business_name,
DROP COLUMN IF EXISTS contact_address,
DROP COLUMN IF EXISTS contact_phone,
DROP COLUMN IF EXISTS contact_email;
