-- ============================================================================
-- CLEANUP DUPLICATE SYSTEM-LEVEL ROLES
-- Purpose: Remove duplicate system-level (business_id = NULL) roles
-- Strategy: Keep the oldest (by created_at), mark others as deleted
-- ============================================================================

-- Step 1: Identify duplicate system-level roles
SELECT
    id,
    name,
    business_id,
    created_at,
    is_deleted
FROM roles
WHERE business_id IS NULL
    AND is_deleted = false
GROUP BY name, business_id
HAVING COUNT(*) > 1
ORDER BY name, created_at;

-- Step 2: Mark duplicate roles as deleted (keep the oldest one for each role name)
UPDATE roles
SET is_deleted = true, updated_at = NOW(), updated_by = 'admin'
WHERE business_id IS NULL
    AND is_deleted = false
    AND id NOT IN (
        -- Get the oldest role for each role name
        SELECT DISTINCT ON (name) id
        FROM roles
        WHERE business_id IS NULL AND is_deleted = false
        ORDER BY name, created_at ASC
    );

-- Step 3: Verify the cleanup
SELECT
    name,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_deleted = false THEN 1 ELSE 0 END) as active_count
FROM roles
WHERE business_id IS NULL
GROUP BY name
ORDER BY name;

-- Step 4: List remaining system-level roles
SELECT
    id,
    name,
    description,
    user_type,
    business_id,
    created_at,
    is_deleted
FROM roles
WHERE business_id IS NULL AND is_deleted = false
ORDER BY name, created_at;
