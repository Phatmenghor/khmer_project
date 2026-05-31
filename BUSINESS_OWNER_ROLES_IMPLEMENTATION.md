# Business-Specific BUSINESS_OWNER Roles Implementation

## Overview
When a business owner registers, a **business-specific BUSINESS_OWNER role** is now automatically created for that business. This ensures:
- Each business has exactly 1 BUSINESS_OWNER role (business_id = specific business UUID)
- Each business has exactly 1 BUSINESS_OWNER user
- Roles are isolated per business (not shared across businesses)

## What Changed

### 1. BusinessOwnerServiceImpl
**New Methods:**
- `createBusinessOwnerRole(UUID businessId)` - Creates a business-specific BUSINESS_OWNER role
- `validateNoExistingBusinessOwner(UUID businessId)` - Ensures only 1 owner per business

**Updated Method:**
- `createOwnerUser()` - Now calls validation and creates business-specific role instead of using system role

### 2. BusinessOwnerRepository
**New Query Method:**
```java
@Query("""
    SELECT COUNT(u) FROM User u
    WHERE u.businessId = :businessId
    AND u.userType = :userType
    AND u.isDeleted = false
""")
long countByBusinessIdAndUserType(@Param("businessId") UUID businessId, @Param("userType") UserType userType);
```

### 3. Database Schema
No changes to schema. The `roles` table structure remains the same:
- `id` - UUID
- `name` - 'BUSINESS_OWNER'
- `business_id` - Now contains the specific business UUID (instead of NULL)
- `user_type` - BUSINESS_USER
- `is_deleted` - false

## Flow Diagram

```
Business Owner Registration Request
    ↓
validateNoExistingBusinessOwner()
    ├─ Query: SELECT COUNT FROM users WHERE businessId=X AND userType=BUSINESS_USER AND !deleted
    └─ If count > 0: Throw ValidationException ("Business already has an owner")
    ↓
createBusiness() - Creates business record
    ↓
createBusinessOwnerRole(businessId)
    ├─ New Role: {name: 'BUSINESS_OWNER', businessId: <specific-uuid>, userType: BUSINESS_USER}
    └─ Save to database
    ↓
createOwnerUser() - Uses the business-specific role
    ├─ Creates User with businessId = <specific-uuid>
    ├─ Assigns business-specific BUSINESS_OWNER role (NOT system role)
    └─ Saves user
    ↓
initializeBusinessDefaults() - Creates default settings
    ↓
Success ✅
```

## Data Examples

### Before (System-Level Role)
```
Role Table:
id: xxx-111, name: 'BUSINESS_OWNER', business_id: NULL, user_type: BUSINESS_USER
id: xxx-222, name: 'BUSINESS_OWNER', business_id: NULL, user_type: BUSINESS_USER  ← Duplicate!

User Table:
id: yyy-111, business_id: aaa-111, roles: [xxx-111]  ← Uses system role
id: yyy-222, business_id: aaa-222, roles: [xxx-111]  ← Uses system role
```

### After (Business-Specific Roles)
```
Role Table:
id: xxx-111, name: 'BUSINESS_OWNER', business_id: aaa-111, user_type: BUSINESS_USER  ← Specific to business A
id: xxx-222, name: 'BUSINESS_OWNER', business_id: aaa-222, user_type: BUSINESS_USER  ← Specific to business B

User Table:
id: yyy-111, business_id: aaa-111, roles: [xxx-111]  ← Uses business-specific role A
id: yyy-222, business_id: aaa-222, roles: [xxx-222]  ← Uses business-specific role B
```

## Validation Rules

1. **One Owner Per Business**
   - When creating owner: Check if business already has a BUSINESS_USER
   - If yes: Throw `ValidationException("Business already has an owner")`

2. **Role Compatibility**
   - System BUSINESS_OWNER role must exist (for validation against UserType.BUSINESS_USER)
   - Business-specific role inherits compatibility from system role

3. **Business Association**
   - New role has `businessId = <specific-uuid>` (never NULL)
   - User has `businessId = <same-uuid>`
   - Together they ensure isolation per business

## Testing Scenarios

### ✅ Success Case
```
POST /api/v1/auth/register-business-owner
{
  "businessName": "My Store",
  "ownerEmail": "owner@example.com",
  "ownerUserIdentifier": "mystore_owner",
  "ownerPassword": "secure123"
}

Response: 201 Created
- Business created
- BUSINESS_OWNER role created for that business
- User created with that role
- Default settings initialized
```

### ❌ Error Case: Second Owner
```
POST /api/v1/auth/register-business-owner
{
  "businessName": "My Store",  ← Same business already has owner
  ...
}

Response: 400 Bad Request
{
  "message": "This business already has an owner. Only one owner is allowed per business."
}
```

## Frontend Impact
✅ **No changes required** - Frontend doesn't need to know about business-specific roles:
- Backend automatically creates the role
- Backend handles all role assignment
- Frontend just makes the registration request

## Related Code Files

1. **Backend:**
   - `BusinessOwnerServiceImpl.java` - Role creation and validation
   - `BusinessOwnerRepository.java` - Query for owner count
   - `RoleRepository.java` - Role persistence

2. **Constants:**
   - `AuthConstants.ROLE_BUSINESS_OWNER` - Still used for system role validation
   - `RoleConstants.BUSINESS_OWNER` - Constants definition

3. **Models:**
   - `User.java` - Has businessId and roles
   - `Role.java` - Has businessId field

## Migration Notes

If migrating existing data:
```sql
-- For each business with an owner, create a business-specific BUSINESS_OWNER role
INSERT INTO roles (id, name, description, business_id, user_type, is_deleted, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'BUSINESS_OWNER',
  'Business Owner - Full access to business operations',
  b.id,
  'BUSINESS_USER',
  false,
  NOW(),
  NOW()
FROM users u
JOIN businesses b ON u.business_id = b.id
WHERE u.user_type = 'BUSINESS_USER'
AND NOT EXISTS (
  SELECT 1 FROM roles r
  WHERE r.business_id = b.id
  AND r.name = 'BUSINESS_OWNER'
  AND r.is_deleted = false
);

-- Update users to use business-specific roles
UPDATE users u
SET roles = ARRAY[r.id]
FROM roles r
WHERE r.business_id = u.business_id
AND r.name = 'BUSINESS_OWNER'
AND r.is_deleted = false
AND u.user_type = 'BUSINESS_USER'
AND u.is_deleted = false;
```

## Future Enhancements

1. Add `BUSINESS_ADMIN` and `BUSINESS_MANAGER` roles (also business-specific)
2. Implement role-based access control (RBAC) checks at endpoint level
3. Add role management UI in admin dashboard
4. Implement role change history audit log
