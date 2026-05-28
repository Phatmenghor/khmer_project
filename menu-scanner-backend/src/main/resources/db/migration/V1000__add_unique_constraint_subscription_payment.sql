-- Clean up duplicates and enforce OneToOne relationship
-- Delete all but the most recent payment for each subscription

-- Step 1: Delete duplicate payments, keeping only the newest one per subscription
DELETE FROM subscription_payments
WHERE id NOT IN (
  SELECT MAX(id)
  FROM subscription_payments
  GROUP BY subscription_id
);

-- Step 2: Add unique constraint to subscription_id to prevent future duplicates
-- This enforces the OneToOne relationship at the database level
ALTER TABLE subscription_payments
ADD CONSTRAINT uk_subscription_payments_subscription_id UNIQUE (subscription_id);
