-- Create 3 base subscription plans - one for each duration type (WEEKLY, MONTHLY, YEARLY)

INSERT INTO subscription_plans (id, name, description, price, status, duration_type, created_at, created_by, updated_at, updated_by, is_deleted)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440101',
    '1 Week',
    'Try the full platform completely free',
    0.00,
    'PUBLIC',
    'WEEKLY',
    NOW(),
    'SYSTEM',
    NOW(),
    'SYSTEM',
    false
  ),
  (
    '550e8400-e29b-41d4-a716-446655440102',
    '1 Month',
    'Full platform access, completely free',
    0.00,
    'PUBLIC',
    'MONTHLY',
    NOW(),
    'SYSTEM',
    NOW(),
    'SYSTEM',
    false
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    '1 Year',
    'Best value for serious businesses',
    0.00,
    'PUBLIC',
    'YEARLY',
    NOW(),
    'SYSTEM',
    NOW(),
    'SYSTEM',
    false
  )
ON CONFLICT DO NOTHING;
