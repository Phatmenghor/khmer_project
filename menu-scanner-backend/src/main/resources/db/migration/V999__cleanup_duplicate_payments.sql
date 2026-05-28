-- Cleanup: Keep only the most recent payment per subscription, delete duplicates
-- This script identifies subscriptions with multiple payments and deletes older duplicates

-- First, let's see which subscriptions have duplicates
-- SELECT subscription_id, COUNT(*) as payment_count
-- FROM subscription_payments
-- WHERE is_deleted = false
-- GROUP BY subscription_id
-- HAVING COUNT(*) > 1
-- ORDER BY payment_count DESC;

-- Delete duplicate payments, keeping only the most recent one per subscription
DELETE FROM subscription_payments
WHERE id IN (
  SELECT sp.id
  FROM subscription_payments sp
  INNER JOIN (
    -- Get the ID of the most recent payment for each subscription
    SELECT subscription_id, MAX(created_at) as latest_created_at
    FROM subscription_payments
    WHERE is_deleted = false
    GROUP BY subscription_id
  ) latest ON sp.subscription_id = latest.subscription_id
  WHERE sp.created_at < latest.latest_created_at
  AND sp.is_deleted = false
);

-- Verify cleanup
-- SELECT subscription_id, COUNT(*) as payment_count
-- FROM subscription_payments
-- WHERE is_deleted = false
-- GROUP BY subscription_id
-- HAVING COUNT(*) > 1;
