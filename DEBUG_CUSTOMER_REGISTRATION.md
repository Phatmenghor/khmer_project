# Customer Registration Error - Root Cause & Fix

## Problem Summary
Customer registration is failing with error:
```
Query did not return a unique result: 2 results were returned
at com.emenu.features.auth.service.impl.AuthServiceImpl.registerCustomer(AuthServiceImpl.java:268)
```

## Root Cause Analysis

### Why 2 Results?
The database has **duplicate system-level CUSTOMER roles** where:
- `name = 'CUSTOMER'`
- `business_id = NULL` (system-level, not business-specific)
- `is_deleted = false` (active)

When the code tries to fetch the role, it gets 2 results instead of 1.

### Why Do Duplicates Exist?
1. The test data script or database initialization created the CUSTOMER role multiple times
2. During development, the database wasn't properly cleaned up
3. No unique constraint exists to prevent duplicate system-level roles

## Solution (3 Steps)

### Step 1: Code Fix (✅ COMPLETED)
Changed all role lookups from:
```java
roleRepository.findByNameAndIsDeletedFalse("CUSTOMER")  // Returns multiple results!
```

To:
```java
List<Role> roles = roleRepository.findSystemRolesByName("CUSTOMER");  // Returns list, safe to handle multiple
```

**Files Updated:**
1. `AuthServiceImpl.java` - Customer registration
2. `BusinessOwnerServiceImpl.java` - Business owner creation
3. `SocialAuthServiceImpl.java` - Social auth (Google, Telegram, etc.)
4. `RoleRepository.java` - New method that returns List instead of Optional

### Step 2: Database Cleanup (⚠️ REQUIRED)
Run the cleanup script to remove duplicate roles:

```bash
# Execute the cleanup script
mysql -u <user> -p <database> < menu-scanner-backend/scripts/cleanup-duplicate-roles.sql
```

Or manually:
```sql
-- Delete duplicate CUSTOMER roles, keep the oldest one
UPDATE roles
SET is_deleted = true, updated_at = NOW(), updated_by = 'admin'
WHERE business_id IS NULL
    AND is_deleted = false
    AND name IN ('CUSTOMER', 'BUSINESS_OWNER', 'PLATFORM_OWNER')
    AND id NOT IN (
        -- Get the oldest role for each role name
        SELECT DISTINCT ON (name) id
        FROM roles
        WHERE business_id IS NULL AND is_deleted = false
        ORDER BY name, created_at ASC
    );
```

### Step 3: Backend Restart (⚠️ REQUIRED)
1. Stop the running backend service
2. Pull the updated code with the fixes
3. Restart the backend service
4. The application will load the new code that handles role lookups correctly

## What Changed

### Before (Broken)
```
Customer calls /api/v1/auth/register
  → AuthServiceImpl.registerCustomer()
    → roleRepository.findByNameAndIsDeletedFalse("CUSTOMER")
      → Returns 2 roles (duplicate system roles)
      → throws NonUniqueResultException ❌
```

### After (Fixed)
```
Customer calls /api/v1/auth/register
  → AuthServiceImpl.registerCustomer()
    → roleRepository.findSystemRolesByName("CUSTOMER")
      → Returns List with 2 roles
      → Takes first (oldest) role
      → Proceeds with registration ✅
```

## Prevention for Future

### Don't Do This:
- Manually insert roles without checking for duplicates
- Use `findByNameAndIsDeletedFalse()` for system-level roles

### Do This Instead:
- Always use `findSystemRolesByName()` for system-level roles
- Use database constraints to prevent duplicate system roles:

```sql
-- Add unique constraint for system-level roles
ALTER TABLE roles
ADD CONSTRAINT uk_system_role_name 
UNIQUE (name) WHERE business_id IS NULL AND is_deleted = false;
```

## Testing
After restart, test customer registration:
```bash
POST /api/v1/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "userIdentifier": "testuser",
  "userType": "CUSTOMER"
}
```

Expected: ✅ Success with user created

## Affected Flows
1. ✅ Customer registration
2. ✅ Social auth (Google, Telegram)
3. ✅ Business owner registration
4. ✅ Platform owner creation

All flows now resilient to duplicate system roles.
