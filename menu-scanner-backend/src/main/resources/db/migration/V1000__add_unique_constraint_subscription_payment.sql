-- Add unique constraint to subscription_id in subscription_payments table
-- Ensures one-to-one relationship: each subscription has only one payment

ALTER TABLE subscription_payments
ADD CONSTRAINT uk_subscription_payments_subscription_id UNIQUE (subscription_id);
