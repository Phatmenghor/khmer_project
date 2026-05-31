# BUSINESS_OWNER Role Protection

## Overview
The BUSINESS_OWNER role is strictly protected. Only the original business owner can have this role. Other users created within the business (employees, managers, admins) cannot be assigned the BUSINESS_OWNER role.

## Rules

### 1. ✅ Allowed
```
Business Owner Registration
  └─ Automatically creates business-specific BUSINESS_OWNER role
  └─ Automatically assigns to the owner user
  └─ Only 1 per business enforced
```

### 2. ❌ Blocked
```
Business Owner Creating Other Users
  └─ Cannot assign BUSINESS_OWNER role to them
  └─ Error: "BUSINESS_OWNER role cannot be assigned to other users"

Business Owner Updating Other Users
  └─ Cannot add BUSINESS_OWNER role via update
  └─ Error: "BUSINESS_OWNER role cannot be assigned to other users"

Social Auth User Creation
  └─ Cannot create BUSINESS_USER via social auth
  └─ Error: "Business users must be created through proper registration"
```

## Implementation

### 1. UserServiceImpl - Create User
**File:** `UserServiceImpl.java`
**Method:** `validateUserCreationRequest()`

```java
// When business owner tries to create a user with BUSINESS_OWNER role:
if (requestData.getRoles().contains("BUSINESS_OWNER")) {
    throw new ValidationException(
        "BUSINESS_OWNER role cannot be assigned to other users..."
    );
}
```

### 2. UserServiceImpl - Update User
**File:** `UserServiceImpl.java`
**Method:** `updateUserRoles()`

```java
// When business owner tries to update a user to have BUSINESS_OWNER role:
if (updateRequestData.getRoles().contains("BUSINESS_OWNER")) {
    throw new ValidationException(
        "BUSINESS_OWNER role cannot be assigned to other users..."
    );
}
```

### 3. SocialAuthServiceImpl - Social Auth
**File:** `SocialAuthServiceImpl.java`
**Method:** `createNewUser()`

```java
// Prevent BUSINESS_USER creation via social auth
if (userTypeEnum == UserType.BUSINESS_USER) {
    throw new ValidationException(
        "Business users must be created through proper registration..."
    );
}
```

## API Response Examples

### ❌ Error: Trying to Create User with BUSINESS_OWNER Role
```
POST /api/v1/users
{
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "userIdentifier": "newemployee",
  "userType": "BUSINESS_USER",
  "roles": ["BUSINESS_OWNER"],  ← Blocked!
  "password": "secure123"
}

Response: 400 Bad Request
{
  "message": "BUSINESS_OWNER role cannot be assigned to other users. Only the original business owner can have this role."
}
```

### ❌ Error: Trying to Update User to Add BUSINESS_OWNER Role
```
PUT /api/v1/users/{userId}
{
  "roles": ["BUSINESS_MANAGER", "BUSINESS_OWNER"]  ← Blocked!
}

Response: 400 Bad Request
{
  "message": "BUSINESS_OWNER role cannot be assigned to other users. Only the original business owner can have this role."
}
```

### ✅ Success: Create User Without BUSINESS_OWNER Role
```
POST /api/v1/users
{
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "userIdentifier": "newemployee",
  "userType": "BUSINESS_USER",
  "roles": ["BUSINESS_MANAGER"],  ← Allowed
  "password": "secure123"
}

Response: 201 Created
{
  "id": "user-xyz",
  "userIdentifier": "newemployee",
  "roles": ["BUSINESS_MANAGER"],
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0"
}
```

### ✅ Success: Create User Without Any Business Owner Role
```
POST /api/v1/users
{
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "userIdentifier": "newemployee",
  "userType": "BUSINESS_USER",
  "roles": ["BUSINESS_ADMIN", "BUSINESS_EMPLOYEE"],  ← Allowed
  "password": "secure123"
}

Response: 201 Created
```

## Database Perspective

### Roles Table
```
id          | name            | business_id | user_type
------------|-----------------|-------------|----------
role-001    | BUSINESS_OWNER  | biz-001     | BUSINESS_USER  ← Specific to biz-001
role-002    | BUSINESS_OWNER  | biz-002     | BUSINESS_USER  ← Specific to biz-002
role-003    | BUSINESS_ADMIN  | biz-001     | BUSINESS_USER  ← Can be assigned
role-004    | BUSINESS_MGMT   | biz-001     | BUSINESS_USER  ← Can be assigned
```

### Users Table
```
id          | business_id | user_type     | roles (from user_roles junction)
------------|-------------|---------------|--------------------------------
user-001    | biz-001     | BUSINESS_USER | [role-001]  ← Owner (immutable)
user-002    | biz-001     | BUSINESS_USER | [role-003]  ← Admin (can be changed)
user-003    | biz-001     | BUSINESS_USER | [role-004]  ← Manager (can be changed)
user-004    | biz-002     | BUSINESS_USER | [role-002]  ← Owner of biz-002
```

## Available Roles for Business Users

When creating employees, managers, admins for a business, use these roles:

### Example Roles (Business-Specific)
```
✅ BUSINESS_ADMIN    - Administrative access
✅ BUSINESS_MANAGER  - Management access
✅ BUSINESS_EMPLOYEE - Limited operational access
✅ BUSINESS_STAFF    - Basic staff access
```

### NOT Available for Assignment
```
❌ BUSINESS_OWNER     - Reserved for original owner only
❌ PLATFORM_OWNER     - System-level, cannot assign
❌ CUSTOMER           - Wrong user type
```

## Testing Scenarios

### Test 1: Create Employee (Should Succeed)
```bash
curl -X POST http://localhost:7070/api/v1/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
    "userIdentifier": "employee1",
    "userType": "BUSINESS_USER",
    "roles": ["BUSINESS_EMPLOYEE"],
    "password": "secure123",
    "email": "employee@example.com"
  }'

Expected: 201 Created ✅
```

### Test 2: Try to Create Employee as Owner (Should Fail)
```bash
curl -X POST http://localhost:7070/api/v1/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
    "userIdentifier": "malicious-owner",
    "userType": "BUSINESS_USER",
    "roles": ["BUSINESS_OWNER"],  ← Blocked
    "password": "secure123",
    "email": "malicious@example.com"
  }'

Expected: 400 Bad Request ❌
Message: "BUSINESS_OWNER role cannot be assigned to other users..."
```

### Test 3: Update Employee to Add Owner Role (Should Fail)
```bash
curl -X PUT http://localhost:7070/api/v1/users/{userId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["BUSINESS_EMPLOYEE", "BUSINESS_OWNER"]  ← Blocked
  }'

Expected: 400 Bad Request ❌
Message: "BUSINESS_OWNER role cannot be assigned to other users..."
```

### Test 4: Update Employee Role (Should Succeed)
```bash
curl -X PUT http://localhost:7070/api/v1/users/{userId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["BUSINESS_MANAGER"]  ← Allowed
  }'

Expected: 200 OK ✅
```

## Related Files

**Backend Implementation:**
- `UserServiceImpl.java` - User creation/update with role validation
- `SocialAuthServiceImpl.java` - Social auth protection
- `BusinessOwnerServiceImpl.java` - Business owner creation (only place BUSINESS_OWNER is assigned)

**Models:**
- `User.java` - Has roles list
- `Role.java` - Has businessId and name

**Constants:**
- `AuthConstants.ROLE_BUSINESS_OWNER` - Role name constant

## Summary

| Operation | Role | Result |
|-----------|------|--------|
| Register Business Owner | BUSINESS_OWNER | ✅ Auto-assigned (only once) |
| Create Employee | BUSINESS_ADMIN, BUSINESS_MANAGER | ✅ Allowed |
| Create Employee | BUSINESS_OWNER | ❌ Blocked |
| Update Employee | BUSINESS_OWNER | ❌ Blocked |
| Social Auth | BUSINESS_USER | ❌ Blocked |
| Update Employee Role | Other roles | ✅ Allowed |

## Future Enhancement

Consider implementing a UI message in the admin panel:
> "⚠️ You are the business owner. This role cannot be transferred to other users. If you need to transfer ownership, contact support."
