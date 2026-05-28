-- Add unique constraint on duration_type to ensure only one plan per duration type
ALTER TABLE subscription_plans ADD CONSTRAINT uk_duration_type UNIQUE (duration_type);
