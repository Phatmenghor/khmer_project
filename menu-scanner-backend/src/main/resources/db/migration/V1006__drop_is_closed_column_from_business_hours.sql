-- Drop is_closed column from business_hours table
ALTER TABLE business_hours DROP COLUMN IF EXISTS is_closed;
