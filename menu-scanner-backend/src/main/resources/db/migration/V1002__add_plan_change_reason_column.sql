-- Add plan_change_reason column to subscriptions table
-- Tracks when a subscription's plan is changed to a new one

ALTER TABLE subscriptions
ADD COLUMN plan_change_reason TEXT;
